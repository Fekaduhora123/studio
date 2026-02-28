
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Church, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const formSchema = z.object({
  donorName: z.string().min(2, "Name is required"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Enter a valid amount"),
  type: z.enum(["Tithe", "Offering", "GoFund", "Special Seed", "Building Purposes"]),
  receipt: z.any().refine((files) => files?.length > 0, "Receipt upload is required"),
});

export default function PublicDonatePage() {
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [refNum, setRefNum] = React.useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      donorName: "",
      amount: "",
      type: "Offering",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    setIsSubmitting(true);

    try {
      const file = values.receipt[0];
      const reader = new FileReader();
      
      const referenceNumber = 'SL-' + Math.random().toString(36).substring(2, 9).toUpperCase();

      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        const donationData = {
          donorName: values.donorName,
          amount: Number(values.amount),
          type: values.type,
          receiptData: base64String,
          status: 'pending',
          referenceNumber,
          timestamp: serverTimestamp(),
        };

        addDoc(collection(firestore, 'donations'), donationData)
          .then(() => {
            setRefNum(referenceNumber);
            setSubmitted(true);
            setIsSubmitting(false);
          })
          .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: 'donations',
              operation: 'create',
              requestResourceData: donationData,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
            setIsSubmitting(false);
          });
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-100 p-4 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-headline mb-2">Thank You!</CardTitle>
          <CardDescription className="text-base mb-6">
            Your donation has been submitted for verification.
          </CardDescription>
          <div className="bg-muted p-4 rounded-lg mb-8">
            <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Reference Number</p>
            <p className="text-xl font-mono font-bold text-primary">{refNum}</p>
          </div>
          <Button asChild className="w-full">
            <Link href="/">Return Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Church className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-bold text-primary">SanctuaryLink Giving</h1>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Submit Your Donation</CardTitle>
            <CardDescription>
              Please fill out the form below and attach your bank transfer receipt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="donorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ($)</FormLabel>
                        <FormControl>
                          <Input placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Donation Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Tithe">Tithe</SelectItem>
                            <SelectItem value="Offering">Offering</SelectItem>
                            <SelectItem value="GoFund">GoFund</SelectItem>
                            <SelectItem value="Special Seed">Special Seed</SelectItem>
                            <SelectItem value="Building Purposes">Building Purposes</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="receipt"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Bank Receipt (Image or PDF)</FormLabel>
                      <FormControl>
                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 bg-muted/30">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <Input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => onChange(e.target.files)}
                            className="max-w-[250px]"
                            {...field}
                          />
                          <p className="text-xs text-muted-foreground mt-2">Max size: 5MB</p>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : "Submit Donation"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="justify-center border-t py-4">
            <Link href="/login" className="text-xs text-muted-foreground hover:text-primary underline">
              Admin Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
