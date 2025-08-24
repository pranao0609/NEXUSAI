# backend/agents/ingestion/csv_ingestor.py
import pandas as pd

class CSVIngestor:
    def fetch(self, file_path: str):
        """
        Ingests data from a CSV file.
        Returns JSON with source info and content as list of dicts.
        """
        try:
            df = pd.read_csv(file_path)
            records = df.to_dict(orient="records")
            return {
                "source": "csv",
                "file_path": file_path,
                "content": records
            }
        except Exception as e:
            return {
                "source": "csv",
                "file_path": file_path,
                "error": str(e)
            }

