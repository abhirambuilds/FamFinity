from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import List
import pandas as pd
import uuid
from datetime import datetime, date
import io
import logging

from routes.auth import get_current_user
from supabase_client import get_server_client

router = APIRouter()

# Request/Response Models
class TransactionResponse(BaseModel):
    success: bool
    message: str
    transactions_imported: int
    errors: List[str] = []

@router.post("/upload-csv", response_model=TransactionResponse)
async def upload_csv(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """
    Upload and parse CSV file with transactions
    Expected columns: date, amount, category
    """
    try:
        user_id = str(current_user.id)
        
        # Validate file size (max 10MB)
        if file.size and file.size > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size must be less than 10MB")
        
        # Validate file type
        if not file.filename or not file.filename.lower().endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")
        
        # Read CSV content
        content = await file.read()
        
        try:
            # Parse CSV with error handling
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
            
            # Check if CSV is empty
            if df.empty:
                raise HTTPException(status_code=400, detail="CSV file is empty")
                
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="CSV file must be UTF-8 encoded")
        except pd.errors.EmptyDataError:
            raise HTTPException(status_code=400, detail="CSV file is empty")
        except pd.errors.ParserError as e:
            raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")
        except Exception as e:
            logging.error(f"CSV parsing error: {str(e)}")
            raise HTTPException(status_code=400, detail="Error parsing CSV file")
        
        # Validate required columns
        required_columns = ['date', 'amount', 'category']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {missing_columns}"
            )
        
        # Validate and clean data
        errors = []
        transactions_to_insert = []
        
        for index, row in df.iterrows():
            try:
                # Parse date
                if isinstance(row['date'], str):
                    transaction_date = datetime.strptime(row['date'], '%Y-%m-%d').date()
                else:
                    transaction_date = pd.to_datetime(row['date']).date()
                
                # Parse amount
                amount = float(row['amount'])
                if amount == 0:
                    errors.append(f"Row {index + 1}: Amount cannot be zero")
                    continue
                
                # Parse category
                category = str(row['category']).strip()
                if not category:
                    errors.append(f"Row {index + 1}: Category cannot be empty")
                    continue
                
                # Extract metadata (any additional columns)
                metadata = {}
                for col in df.columns:
                    if col not in required_columns and pd.notna(row[col]):
                        metadata[col] = str(row[col])
                
                transactions_to_insert.append({
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "date": transaction_date,
                    "amount": amount,
                    "category": category,
                    "metadata": metadata,
                    "created_at": datetime.utcnow()
                })
                
            except Exception as e:
                errors.append(f"Row {index + 1}: {str(e)}")
                continue
        
        if not transactions_to_insert:
            raise HTTPException(
                status_code=400, 
                detail="No valid transactions found in CSV"
            )
        
        # Bulk insert transactions via Supabase API (service role)
        sb = get_server_client()
        # Convert date objects to isoformat strings
        payload = []
        for t in transactions_to_insert:
            row = t.copy()
            row["date"] = row["date"].isoformat() if isinstance(row["date"], (datetime, date)) else row["date"]
            row["created_at"] = row["created_at"].isoformat() if isinstance(row["created_at"], (datetime, date)) else row["created_at"]
            payload.append(row)
        resp = sb.table('transactions').insert(payload).execute()
        if getattr(resp, 'error', None):
            raise HTTPException(status_code=500, detail="Failed to insert transactions")
        transactions_imported = len(payload)
        
        return TransactionResponse(
            success=True,
            message=f"Successfully imported {transactions_imported} transactions",
            transactions_imported=transactions_imported,
            errors=errors
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transactions")
async def get_user_transactions(
    limit: int = 100,
    offset: int = 0,
    current_user = Depends(get_current_user)
):
    """
    Get transactions for a user with pagination
    """
    try:
        user_id = str(current_user.id)
        
        sb = get_server_client()
        start = offset
        end = max(offset, offset + limit - 1)
        res = (
            sb.table('transactions')
              .select('id, date, amount, category, metadata, created_at')
              .eq('user_id', user_id)
              .order('date', desc=True)
              .range(start, end)
              .execute()
        )
        data = getattr(res, 'data', []) or []
        
        return {
            "user_id": user_id,
            "transactions": [
                {
                    "id": str(t.get('id')),
                    "date": str(t.get('date')),
                    "amount": float(t.get('amount', 0)),
                    "category": t.get('category'),
                    "metadata": t.get('metadata'),
                    "created_at": str(t.get('created_at'))
                }
                for t in data
            ],
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
