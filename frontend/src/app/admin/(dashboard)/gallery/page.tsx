"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Image as ImageIcon, Video, Tag, MoveUp, MoveDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function GalleryManagementPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setItems([
            { id: '1', type: 'IMAGE', url: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770', tag: 'fabric-sourcing', displayOrder: 0 },
            { id: '2', type: 'VIDEO', url: 'https://example.com/bts.mp4', tag: 'bts', displayOrder: 1 },
            { id: '3', type: 'IMAGE', url: 'https://images.unsplash.com/photo-1610030469668-93510ec2c321', tag: 'best-seller', displayOrder: 2 },
        ]);
        setLoading(false);
    }, []);

    const addItem = () => {
        const newItem = {
            id: Date.now().toString(),
            type: "IMAGE",
            url: "",
            tag: "bts",
            displayOrder: items.length
        };
        setItems([...items, newItem]);
    };

    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gallery Manager</h2>
                    <p className="text-muted-foreground">Manage your brand's visual story and BTS content.</p>
                </div>
                <Button onClick={addItem} className="bg-[#480100] hover:bg-[#480100]/90">
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item, idx) => (
                    <Card key={item.id} className="overflow-hidden group">
                        <div className="aspect-video relative bg-muted flex items-center justify-center">
                            {item.url ? (
                                item.type === 'IMAGE' ? (
                                    <img src={item.url} alt="Gallery" className="object-cover w-full h-full" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <Video className="h-10 w-10 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Video Link</span>
                                    </div>
                                )
                            ) : (
                                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                            )}
                            <Badge className="absolute top-2 left-2 uppercase text-[10px] tracking-widest bg-black/60 backdrop-blur-md">
                                {item.tag}
                            </Badge>
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => {
                                    toast.info("Opening preview...");
                                }}>
                                    <ExternalLink className="h-3 w-3" />
                                </Button>
                                <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => {
                                    setItems(items.filter(i => i.id !== item.id));
                                }}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">URL / Cloudinary Link</label>
                                <Input
                                    className="h-8 text-xs"
                                    value={item.url}
                                    onChange={(e) => {
                                        const newItems = [...items];
                                        newItems[idx].url = e.target.value;
                                        setItems(newItems);
                                    }}
                                    placeholder="Paste URL here..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Type</label>
                                    <Select
                                        value={item.type}
                                        onValueChange={(val) => {
                                            const newItems = [...items];
                                            newItems[idx].type = val;
                                            setItems(newItems);
                                        }}
                                    >
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="IMAGE">Image</SelectItem>
                                            <SelectItem value="VIDEO">Video</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Tag</label>
                                    <Select
                                        value={item.tag}
                                        onValueChange={(val) => {
                                            const newItems = [...items];
                                            newItems[idx].tag = val;
                                            setItems(newItems);
                                        }}
                                    >
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bts">Behind Scenes</SelectItem>
                                            <SelectItem value="fabric-sourcing">Fabric Sourcing</SelectItem>
                                            <SelectItem value="best-seller">Best Sellers</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t">
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                        <MoveUp className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                        <MoveDown className="h-3 w-3" />
                                    </Button>
                                </div>
                                <Button size="sm" className="h-8 bg-[#480100] text-[#F7DFB9] text-xs">
                                    Update
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
