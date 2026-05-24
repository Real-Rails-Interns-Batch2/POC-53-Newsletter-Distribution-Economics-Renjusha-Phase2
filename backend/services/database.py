import os
import json
import duckdb
import pandas as pd
from dotenv import load_dotenv
from mock_data.generator import generate_mock_data

# Load environment variables
load_dotenv()

class DatabaseManager:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(DatabaseManager, cls).__new__(cls, *args, **kwargs)
            cls._instance.initialized = False
        return cls._instance

    def initialize(self):
        if self.initialized:
            return
            
        self.mock_data_path = os.getenv("MOCK_DATA_PATH", "mock_data/mock_data.json")
        self.db_path = os.getenv("DATABASE_PATH", "newsletter_economics.db")
        
        # Ensure path resolves correctly from workspace root
        if not os.path.isabs(self.mock_data_path):
            # Resolve relative to current working dir
            self.mock_data_path = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), self.mock_data_path))
            
        # 2-Hour Rule Failover: Fallback to mock data generation if not exists or corrupt
        if not os.path.exists(self.mock_data_path):
            print(f"Mock data file not found at {self.mock_data_path}. Running generator...")
            try:
                generate_mock_data()
            except Exception as e:
                print(f"Error generating mock data: {e}")
                
        try:
            with open(self.mock_data_path, 'r') as f:
                self.raw_data = json.load(f)
        except Exception as e:
            print(f"Failed to read mock data JSON: {e}. Regenerating...")
            generate_mock_data()
            with open(self.mock_data_path, 'r') as f:
                self.raw_data = json.load(f)
                
        # Initialize DuckDB connection (we'll use in-memory so it's always clean and fast)
        self.conn = duckdb.connect(database=':memory:')
        
        # Load tables
        self._load_tables()
        self.initialized = True
        print("DuckDB database initialized successfully.")

    def _load_tables(self):
        # Read components into dataframes
        df_subscribers = pd.DataFrame(self.raw_data["subscribers"])
        df_referrals = pd.DataFrame(self.raw_data["referrals"])
        df_sponsorships = pd.DataFrame(self.raw_data["sponsorships"])
        df_benchmarks = pd.DataFrame(self.raw_data["benchmarks"])
        
        # Register them with DuckDB
        self.conn.register("subscribers_temp", df_subscribers)
        self.conn.register("referrals_temp", df_referrals)
        self.conn.register("sponsorships_temp", df_sponsorships)
        self.conn.register("benchmarks_temp", df_benchmarks)
        
        # Create persistent tables
        self.conn.execute("CREATE TABLE subscribers AS SELECT * FROM subscribers_temp")
        self.conn.execute("CREATE TABLE referrals AS SELECT * FROM referrals_temp")
        self.conn.execute("CREATE TABLE sponsorships AS SELECT * FROM sponsorships_temp")
        self.conn.execute("CREATE TABLE benchmarks AS SELECT * FROM benchmarks_temp")
        
        print("Registered tables: subscribers, referrals, sponsorships, benchmarks in DuckDB.")

    def execute_query(self, query: str, params: list = None) -> pd.DataFrame:
        """Executes a SQL query on the DuckDB database and returns a Pandas DataFrame."""
        if not self.initialized:
            self.initialize()
            
        try:
            if params:
                # DuckDB execute with parameters
                return self.conn.execute(query, params).df()
            else:
                return self.conn.execute(query).df()
        except Exception as e:
            # Fallback/Safe state under 2-Hour Rule
            print(f"DuckDB query execution failed: {e}. Executing fallback querying via Pandas on raw json.")
            return self._fallback_query(query, params)
            
    def _fallback_query(self, query: str, params: list = None) -> pd.DataFrame:
        """Fallback querying engine using direct Pandas on loaded JSON in case DuckDB fails."""
        # Simple string matching to guess which dataset is requested
        q_lower = query.lower()
        if "subscribers" in q_lower:
            df = pd.DataFrame(self.raw_data["subscribers"])
        elif "referrals" in q_lower:
            df = pd.DataFrame(self.raw_data["referrals"])
        elif "sponsorships" in q_lower or "campaigns" in q_lower:
            df = pd.DataFrame(self.raw_data["sponsorships"])
        elif "benchmarks" in q_lower:
            df = pd.DataFrame(self.raw_data["benchmarks"])
        else:
            df = pd.DataFrame()
            
        print(f"Fallback query returned dataframe with shape: {df.shape}")
        return df

db_manager = DatabaseManager()
