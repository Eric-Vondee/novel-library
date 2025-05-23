import React from 'react'
import { Button } from './ui/button'
import { AlertCircle } from 'lucide-react'
import { BookLoadError } from '@/lib/epub-helper'

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback
        return <Fallback error={this.state.error} reset={this.reset} />
      }

      return (
        <div className='fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50'>
          <div className='text-center p-6 bg-background rounded-lg shadow-lg max-w-md'>
            <AlertCircle className='h-12 w-12 text-destructive mx-auto mb-4' />
            <h2 className='text-xl font-semibold mb-2'>Something went wrong</h2>
            <p className='text-muted-foreground mb-4'>
              {this.state.error instanceof BookLoadError
                ? this.state.error.message
                : this.state.error.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={this.reset} variant='default'>
              Try again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
