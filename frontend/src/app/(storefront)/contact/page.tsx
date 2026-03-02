"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ContactPage() {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success("Thank you for your message. We will get back to you soon.");
        setLoading(false);
        (e.target as HTMLFormElement).reset();
    };

    return (
        <div className="bg-white min-h-screen pt-24">
            <div className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">

                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-12"
                    >
                        <div>
                            <h1 className="text-4xl md:text-6xl font-vogue font-bold uppercase tracking-[0.2em] text-[#480100] mb-6">
                                Contact Us
                            </h1>
                            <div className="h-0.5 w-16 bg-[#480100] mb-8" />
                            <p className="text-slate-500 font-medium leading-relaxed max-w-md italic">
                                We'd love to hear from you. Whether you have a question about our craftsmanship,
                                shipping, or a custom order, our team is here to help.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                    <Mail className="h-4 w-4 text-[#480100]" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Email Us</h4>
                                    <p className="text-sm font-bold tracking-widest uppercase">hello@wovenkulture.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                    <MapPin className="h-4 w-4 text-[#480100]" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Visit Our Studio</h4>
                                    <p className="text-sm font-bold tracking-widest uppercase leading-relaxed">
                                        123 Artisan Lane, Craft Village<br />
                                        Lagos, Nigeria
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                    <Phone className="h-4 w-4 text-[#480100]" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Call Us</h4>
                                    <p className="text-sm font-bold tracking-widest uppercase">+234 (0) 800 WOVEN</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links Placeholder */}
                        <div className="pt-8 border-t border-slate-100 flex gap-6">
                            <span className="text-[10px] font-bold uppercase tracking-widest hover:text-[#480100] cursor-pointer transition-colors">Instagram</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest hover:text-[#480100] cursor-pointer transition-colors">Pinterest</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest hover:text-[#480100] cursor-pointer transition-colors">Twitter</span>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-slate-50/50 p-8 md:p-12 border border-slate-100 rounded-none relative overflow-hidden"
                    >
                        {/* Decorative Background Element */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#480100]/5 rounded-full blur-3xl" />

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#480100]/60 ml-1">Full Name</label>
                                    <Input
                                        required
                                        placeholder="JOHN DOE"
                                        className="h-12 rounded-none border-slate-200 placeholder:text-slate-300 font-bold tracking-widest text-xs focus-visible:ring-1 focus-visible:ring-[#480100]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#480100]/60 ml-1">Email Address</label>
                                    <Input
                                        required
                                        type="email"
                                        placeholder="EMAIL@EXAMPLE.COM"
                                        className="h-12 rounded-none border-slate-200 placeholder:text-slate-300 font-bold tracking-widest text-xs focus-visible:ring-1 focus-visible:ring-[#480100]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#480100]/60 ml-1">Subject</label>
                                <Input
                                    required
                                    placeholder="HOW CAN WE HELP?"
                                    className="h-12 rounded-none border-slate-200 placeholder:text-slate-300 font-bold tracking-widest text-xs focus-visible:ring-1 focus-visible:ring-[#480100]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#480100]/60 ml-1">Message</label>
                                <Textarea
                                    required
                                    placeholder="TELL US MORE..."
                                    className="min-h-[160px] rounded-none border-slate-200 placeholder:text-slate-300 font-bold tracking-widest text-xs focus-visible:ring-1 focus-visible:ring-[#480100] resize-none"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-[#480100] hover:bg-[#480100]/90 text-white rounded-none uppercase text-[10px] font-bold tracking-[0.3em] transition-all"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Send className="h-3.5 w-3.5" />
                                        Send Message
                                    </div>
                                )}
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
