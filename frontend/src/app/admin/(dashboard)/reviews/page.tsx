"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { RefreshCw, Star, Trash2, MessageSquare } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    product: { id: string; name: string; images: string[] };
    user: { id: string; email: string };
}

interface Stats {
    total: number;
    averageRating: number;
    byRating: Record<number, number>;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, averageRating: 0, byRating: {} });
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
    const [loading, setLoading] = useState(true);
    const [ratingFilter, setRatingFilter] = useState<number | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingReview, setDeletingReview] = useState<Review | null>(null);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("page", pagination.page.toString());
            params.append("limit", "10");
            if (ratingFilter) params.append("rating", ratingFilter.toString());

            const [reviewsData, statsData] = await Promise.all([
                fetchApi(`/reviews/admin/list?${params}`),
                fetchApi("/reviews/admin/stats"),
            ]);

            setReviews(reviewsData.reviews);
            setPagination(reviewsData.pagination);
            setStats(statsData);
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, ratingFilter]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleDelete = async () => {
        if (!deletingReview) return;
        try {
            await fetchApi(`/reviews/admin/${deletingReview.id}`, {
                method: "DELETE",
            });
            setDeleteDialogOpen(false);
            setDeletingReview(null);
            fetchReviews();
        } catch (error) {
            console.error("Failed to delete review:", error);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
                    <p className="text-muted-foreground">Manage product reviews</p>
                </div>
                <Button onClick={fetchReviews} variant="outline" size="sm">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" /> Total Reviews
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Star className="h-4 w-4" /> Average Rating
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</span>
                            {renderStars(Math.round(stats.averageRating))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Rating Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <button
                                    key={rating}
                                    onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${ratingFilter === rating
                                        ? "bg-yellow-100 text-yellow-800 ring-2 ring-yellow-400"
                                        : "bg-slate-100 hover:bg-slate-200"
                                        }`}
                                >
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    {rating} ({stats.byRating[rating] || 0})
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reviews List */}
            <Card>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {loading ? (
                            <div className="px-4 py-12 text-center text-muted-foreground">Loading reviews...</div>
                        ) : reviews.length === 0 ? (
                            <div className="px-4 py-12 text-center text-muted-foreground">
                                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                No reviews found
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} className="p-4 hover:bg-slate-50">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {renderStars(review.rating)}
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm mb-2">{review.comment}</p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>Product: <strong>{review.product.name}</strong></span>
                                                <span>By: <strong>{review.user.email}</strong></span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive"
                                            onClick={() => {
                                                setDeletingReview(review);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Review</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this review? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {deletingReview && (
                        <div className="py-4 bg-slate-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">{renderStars(deletingReview.rating)}</div>
                            <p className="text-sm">{deletingReview.comment}</p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
