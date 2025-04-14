"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Database, CheckCircle, AlertCircle } from "lucide-react"

type DatabaseStatus = {
  status: string
  message: string
  stats?: {
    userCount: number
    spaceCount: number
    executionTime: string
  }
  database?: {
    name: string
    version: string
  }
  error?: {
    name: string
    message: string
    code: string
  }
  timestamp: string
}

export default function DatabaseStatusPage() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkDatabaseStatus = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/db-status')
      const data = await response.json()
      setStatus(data)
    } catch (err) {
      console.error('Error checking database status:', err)
      setError('Failed to fetch database status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Database Status</h1>
        <p className="text-muted-foreground">Check if your database connection is working properly</p>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Database Connection Status</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkDatabaseStatus}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
          <CardDescription>
            Last checked: {status?.timestamp ? new Date(status.timestamp).toLocaleString() : 'Never'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Checking database connection...</span>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 p-4 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
              <div>
                <h3 className="font-semibold">Error</h3>
                <p>{error}</p>
              </div>
            </div>
          ) : status ? (
            <div className="space-y-6">
              <div className="flex items-center">
                {status.status === 'connected' ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                    <span className="font-medium text-lg">{status.message}</span>
                    <Badge className="ml-3 bg-green-500" variant="secondary">
                      Connected
                    </Badge>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-6 w-6 text-destructive mr-2" />
                    <span className="font-medium text-lg">{status.message}</span>
                    <Badge className="ml-3" variant="destructive">
                      Error
                    </Badge>
                  </>
                )}
              </div>
              
              {status.status === 'connected' && status.stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Database</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{status.database?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Version: {status.database?.version?.split(' ')[0] || 'Unknown'}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{status.stats.userCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total users in database</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Spaces</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{status.stats.spaceCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total workspace listings</p>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {status.status === 'error' && status.error && (
                <div className="bg-destructive/10 p-4 rounded-md mt-4">
                  <h3 className="font-semibold mb-2">Error Details</h3>
                  <p><strong>Name:</strong> {status.error.name}</p>
                  <p><strong>Message:</strong> {status.error.message}</p>
                  {status.error.code && <p><strong>Code:</strong> {status.error.code}</p>}
                </div>
              )}
              
              {status.status === 'connected' && (
                <div className="text-sm text-muted-foreground">
                  <p>Query execution time: {status.stats?.executionTime}</p>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
        
        <CardFooter className="bg-muted/50 text-sm text-muted-foreground">
          <p>
            If the database connection is failing, check your <code className="bg-muted px-1 py-0.5 rounded">.env</code> file 
            and make sure <code className="bg-muted px-1 py-0.5 rounded">DATABASE_URL</code> is correctly configured.
          </p>
        </CardFooter>
      </Card>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Troubleshooting</h2>
        
        <div className="space-y-2">
          <h3 className="font-medium">1. Check your .env file</h3>
          <p className="text-muted-foreground">
            Make sure your <code className="bg-muted px-1 py-0.5 rounded">DATABASE_URL</code> is correctly set in your .env file.
            It should look something like: <code className="bg-muted px-1 py-0.5 rounded">postgresql://username:password@localhost:5432/database_name</code>
          </p>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">2. Verify PostgreSQL is running</h3>
          <p className="text-muted-foreground">
            Ensure your PostgreSQL server is running and accessible at the host and port specified in your connection string.
          </p>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">3. Run Prisma migrations</h3>
          <p className="text-muted-foreground">
            If your database exists but tables are missing, you may need to run Prisma migrations:
          </p>
          <pre className="bg-muted p-2 rounded-md text-sm overflow-x-auto">
            npx prisma migrate dev
          </pre>
        </div>
      </div>
    </div>
  )
}
