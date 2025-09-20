export type Repo = {
  id: number;                                
  full_name: string;                         
  description: string | null;                
  stargazers_count: number;                
  html_url: string;                          
  updated_at: string;                        
  owner: { login: string; avatar_url: string };
};

export type SearchResponse = {
  total_count: number;                      
  incomplete_results: boolean;              
  items: Repo[];                             
};