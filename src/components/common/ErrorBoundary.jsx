import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    /** t() returns the key string when translation is missing — don't show raw keys */
    tr(key, fallback) {
        const v = this.props.t?.(key);
        return typeof v === 'string' && v !== key ? v : fallback;
    }

    render() {
        if (this.state.hasError) {
            const err = this.state.error;
            const isDev = process.env.NODE_ENV === 'development';
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
                    <div className="max-w-md w-full text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-10 h-10 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-display font-bold text-gray-900 mb-3">
                            {this.tr('errorBoundaryTitle', "Nimadir noto'g'ri ketdi")}
                        </h1>
                        <p className="text-gray-600 mb-8">
                            {this.tr('errorBoundaryDesc', "Uzr, sahifa yuklanayotganda xatolik yuz berdi. Qayta urinib ko'ring.")}
                        </p>
                        {isDev && err && (
                            <pre className="text-left text-xs bg-red-50 text-red-900 p-3 rounded-lg mb-6 overflow-auto max-h-40 border border-red-200 whitespace-pre-wrap break-words">
                                {err.toString()}
                            </pre>
                        )}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
                            >
                                <RefreshCw className="w-5 h-5" />
                                {this.tr('retry', 'Qayta urinish')}
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                            >
                                <Home className="w-5 h-5" />
                                {this.tr('home', 'Bosh sahifa')}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
