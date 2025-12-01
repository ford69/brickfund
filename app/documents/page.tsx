'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Upload, 
  Download, 
  FileText, 
  Image, 
  File,
  Trash2,
  Eye,
  Search,
  Filter,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  Folder,
  FolderOpen
} from 'lucide-react';
import { apiClient, DocumentFile } from '@/lib/api';

export default function DocumentManagement() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getDocuments();
      if (response.success && response.data) {
        setDocuments(response.data);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const formatFileSize = (size?: number | string) => {
    if (typeof size === 'string') return size;
    if (typeof size !== 'number' || Number.isNaN(size)) return '—';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = size;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex += 1;
    }
    return `${value.toFixed(1)} ${units[unitIndex]}`;
  };

  const categories = [
    { id: 'all', name: 'All Documents', count: documents.length },
    { id: 'investment', name: 'Investment Documents', count: documents.filter(d => d.category === 'investment').length },
    { id: 'kyc', name: 'KYC Documents', count: documents.filter(d => d.category === 'kyc').length },
    { id: 'financial', name: 'Financial Documents', count: documents.filter(d => d.category === 'financial').length },
    { id: 'project', name: 'Project Documents', count: documents.filter(d => d.category === 'project').length }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'image':
        return <Image className="h-8 w-8 text-blue-500" />;
      case 'contract':
        return <FileText className="h-8 w-8 text-green-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const projectName =
      typeof doc.project === 'string'
        ? doc.project
        : doc.project?.title;
    const description = doc.description || '';

    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (projectName && projectName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = activeTab === 'all' || doc.category === activeTab;

    return matchesSearch && matchesCategory;
  });

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleBulkDelete = async () => {
    if (!selectedFiles.length) return;
    try {
      setBulkActionLoading(true);
      await Promise.all(selectedFiles.map((id) => apiClient.deleteDocument(id)));
      setSelectedFiles([]);
      await fetchDocuments();
    } catch (err) {
      console.error('Failed to delete documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete documents');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    try {
      setIsUploading(true);
      await apiClient.uploadDocuments(formData);
      await fetchDocuments();
      setError('');
    } catch (err) {
      console.error('Failed to upload documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload documents');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-700" />
              <span className="ml-2 text-2xl font-bold text-gray-900">BrickFund</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost">Profile</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
              <p className="text-gray-600 mt-2">Manage your investment documents and KYC files</p>
            </div>
            <div className="flex space-x-4">
              <input
                type="file"
                id="file-upload"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="file-upload">
                <Button asChild disabled={isUploading}>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload Documents'}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Document Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : documents.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : documents.filter(d => d.status === 'verified').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : documents.filter(d => d.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : documents.filter(d => d.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            {selectedFiles.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {bulkActionLoading ? 'Deleting...' : `Delete (${selectedFiles.length})`}
              </Button>
            )}
          </div>
        </div>

        {/* Document Categories */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name} ({category.count})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-700"></div>
                  <p className="text-gray-600">Loading documents...</p>
                </CardContent>
              </Card>
            ) : filteredDocuments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ? 'Try adjusting your search terms' : 'Upload your first document to get started'}
                  </p>
                  <input
                    type="file"
                    id="empty-upload"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="empty-upload">
                    <Button asChild disabled={isUploading}>
                      <span>
                        <Plus className="h-4 w-4 mr-2" />
                        {isUploading ? 'Uploading...' : 'Upload Documents'}
                      </span>
                    </Button>
                  </label>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map((document) => (
                  <Card key={document._id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {getFileIcon(document.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {document.name}
                            </h3>
                            <input
                              type="checkbox"
                              checked={selectedFiles.includes(document._id)}
                              onChange={() => handleFileSelect(document._id)}
                              className="ml-2"
                            />
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {document.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <span>{formatFileSize(document.size)}</span>
                            <span>{document.uploadedAt ? new Date(document.uploadedAt).toLocaleDateString() : '—'}</span>
                          </div>
                          
                          {document.project && (
                            <div className="mb-3">
                              <Badge variant="outline" className="text-xs">
                                {typeof document.project === 'string'
                                  ? document.project
                                  : document.project?.title}
                              </Badge>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {getStatusIcon(document.status || 'pending')}
                              <Badge className={`ml-2 ${getStatusColor(document.status || 'pending')}`}>
                                {document.status || 'pending'}
                              </Badge>
                            </div>
                            
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Upload Guidelines */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Document Upload Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Supported File Types</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• PDF documents (.pdf)</li>
                  <li>• Images (.jpg, .jpeg, .png)</li>
                  <li>• Word documents (.doc, .docx)</li>
                  <li>• Maximum file size: 10MB</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Document Requirements</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Clear, readable documents</li>
                  <li>• All text must be visible</li>
                  <li>• Documents must be current (within 3 months)</li>
                  <li>• Original documents preferred</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}