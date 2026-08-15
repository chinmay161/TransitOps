"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary Caught Error]:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#070D1A] p-6 text-[#F0F4FF]">
          <div className="max-w-md w-full rounded-[24px] border border-red-500/20 bg-[#0D1526] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl text-red-400">
              ⚠️
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">Something went wrong</h2>
            <p className="mt-2 text-sm text-[#7F93B7]">
              An unexpected error occurred while rendering this page.
            </p>
            {this.state.error?.message ? (
              <div className="mt-4 rounded-xl border border-red-500/10 bg-red-500/5 p-3 text-xs text-red-300 font-mono overflow-auto max-h-32">
                {this.state.error.message}
              </div>
            ) : null}
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={this.handleRetry}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
