'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Check,
  X,
  Loader2,
  FileText,
} from 'lucide-react';
import { apiClient, Project } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function AdminProjectReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : '';
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getProject(id);
        if (response.success && response.data) {
          setProject(response.data);
          setError('');
        } else {
          setError(response.message || 'Project not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const handleApprove = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const response = await apiClient.approveProject(id, reviewNotes || undefined);
      if (response.success) {
        toast({ title: 'Approved', description: 'Project has been approved.' });
        setApproveDialogOpen(false);
        setReviewNotes('');
        router.push('/admin');
      } else {
        toast({ title: 'Error', description: response.message || 'Approve failed', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Approve failed', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    if (!reviewNotes.trim()) {
      toast({ title: 'Reason required', description: 'Please provide a reason for rejection.', variant: 'destructive' });
      return;
    }
    setActionLoading(true);
    try {
      const response = await apiClient.rejectProject(id, reviewNotes.trim());
      if (response.success) {
        toast({ title: 'Rejected', description: 'Project has been rejected.' });
        setRejectDialogOpen(false);
        setReviewNotes('');
        router.push('/admin');
      } else {
        toast({ title: 'Error', description: response.message || 'Reject failed', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Reject failed', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <p className="mt-3 text-slate-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive mb-4">{error || 'Project not found'}</p>
          <Link href="/admin">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const developerName =
    project.developer && typeof project.developer === 'object' && 'firstName' in project.developer
      ? `${(project.developer as { firstName?: string; lastName?: string }).firstName ?? ''} ${(project.developer as { lastName?: string }).lastName ?? ''}`.trim() || 'Unknown'
      : 'Unknown';
  const progress = project.targetAmount ? Math.min(100, (project.raisedAmount / project.targetAmount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Badge
            className={
              project.status === 'pending'
                ? 'bg-amber-100 text-amber-800'
                : project.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : project.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-slate-100 text-slate-800'
            }
          >
            {project.status}
          </Badge>
          {project.status === 'pending' && (
            <>
              <Button variant="outline" size="sm" onClick={() => setRejectDialogOpen(true)} className="text-red-600">
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button size="sm" onClick={() => setApproveDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Project header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{project.title}</CardTitle>
          <CardDescription>{project.shortDescription || project.description?.slice(0, 160)}</CardDescription>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-sm text-slate-600 flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {developerName}
            </span>
            <span className="text-sm text-slate-600 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {project.location?.city}, {project.location?.state}
            </span>
            <span className="text-sm text-slate-600 capitalize">{project.category}</span>
          </div>
        </CardHeader>
      </Card>

      {/* Funding */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Funding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-500">Target</p>
              <p className="font-semibold">{formatCurrency(project.targetAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Raised</p>
              <p className="font-semibold">{formatCurrency(project.raisedAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Min. investment</p>
              <p className="font-semibold">{formatCurrency(project.minimumInvestment)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">ROI</p>
              <p className="font-semibold">{project.roi ?? 0}%</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financials & timeline */}
      {project.financials && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Financials
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-500">Total project cost</p>
              <p className="font-semibold">{formatCurrency(project.financials.totalProjectCost)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Projected return</p>
              <p className="font-semibold">{formatCurrency(project.financials.projectedReturn)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Expected completion</p>
              <p className="font-semibold">{project.financials.expectedCompletion || '—'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 whitespace-pre-wrap">{project.description || 'No description.'}</p>
        </CardContent>
      </Card>

      {/* Reject dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Project</DialogTitle>
            <DialogDescription>Provide a reason for rejection (required).</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Reason for rejection..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!reviewNotes.trim() || actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Project</DialogTitle>
            <DialogDescription>Optionally add notes. The project will go live after approval.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Internal notes..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={actionLoading} className="bg-green-600 hover:bg-green-700">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
