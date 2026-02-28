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
import { Church, Upload, CheckCircle2, Loader2, Info, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { scanReceipt } from '@/ai/flows/scan-receipt-flow';

const formSchema = z.object({
  donorName: z.string().min(2, "Name is required"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Enter a valid amount"),
  type: z.enum(["Tithe", "Offering", "GoFund", "Special Seed", "Building Purposes"]),
  receipt: z.any().optional(),
});

export default function PublicDonatePage() {
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [refNum, setRefNum] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const [scanError, setScanError] = React.useState<string | null>(null);
  const [isAiVerified, setIsAiVerified] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      donorName: "",
      amount: "",
      type: "Offering",
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setScanError(null);
    setIsAiVerified(false);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUri = reader.result as string;
      
      setIsScanning(true);
      try {
        const result = await scanReceipt({ receiptDataUri: dataUri });
        
        if (!result.isCorrectAccount) {
          setScanError("The AI couldn't verify this receipt was sent to MUGHER FULL GOSPEL CHURCH (Account: 1000221935978). Please check your upload.");
          form.setValue('receipt', undefined);
        } else {
          if (result.donorName) {
            form.setValue('donorName', result.donorName, { shouldValidate: true });
          }
          if (result.amount > 0) {
            form.setValue('amount', result.amount.toString(), { shouldValidate: true });
          }
          setIsAiVerified(true);
          form.setValue('receipt', undefined);
          if (e.target) e.target.value = ''; 
        }
      } catch (err) {
        console.error("AI Scan failed", err);
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    setIsSubmitting(true);

    const referenceNumber = 'SL-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    const donationData = {
      donorName: values.donorName,
      amount: Number(values.amount),
      type: values.type,
      receiptData: null, 
      isAiVerified: isAiVerified,
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
  }

  if (!mounted) return null;

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-100 p-4 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-headline mb-2 text-primary">Thank You!</CardTitle>
          <CardDescription className="text-base mb-6">
            Your donation has been submitted for verification.
          </CardDescription>
          <div className="bg-muted p-4 rounded-lg mb-8">
            <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Reference Number</p>
            <p className="text-xl font-mono font-bold text-primary">{refNum}</p>
          </div>
          <Button asChild className="w-full bg-primary h-12">
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
          <h1 className="text-2xl font-headline font-bold text-primary">MUGHER FULL GOSPEL Giving</h1>
        </div>

        <Alert className="mb-6 bg-primary/5 border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary font-bold">Official Deposit Account</AlertTitle>
          <AlertDescription className="text-sm font-medium leading-relaxed">
            Please ensure all deposits are made only to account: 
            <span className="font-bold text-lg block mt-1 tracking-tight">1000221935978</span>
            <span className="text-muted-foreground italic font-medium uppercase">MUGHER FULL GOSPEL CHURCH</span>
          </AlertDescription>
        </Alert>

        {scanError && (
          <Alert variant="destructive" className="mb-6 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Validation Error</AlertTitle>
            <AlertDescription>{scanError}</AlertDescription>
          </Alert>
        )}

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-headline text-primary">Submit Your Donation</CardTitle>
            <CardDescription>
              Upload your receipt for instant AI verification. The image is discarded after verification to protect your privacy and save space.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="receipt"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>AI Receipt Verification (Optional)</FormLabel>
                      <FormControl>
                        <div className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 transition-colors relative ${isAiVerified ? 'bg-emerald-50 border-emerald-200' : 'bg-muted/30 hover:bg-muted/50'} ${isScanning ? 'opacity-50 pointer-events-none' : ''}`}>
                          {isScanning ? (
                            <div className="flex flex-col items-center gap-2 text-primary">
                              <Loader2 className="h-8 w-8 animate-spin" />
                              <p className="text-sm font-bold animate-pulse">Scanning Receipt...</p>
                            </div>
                          ) : isAiVerified ? (
                            <div className="flex flex-col items-center gap-2 text-emerald-600 animate-in zoom-in duration-300">
                              <ShieldCheck className="h-10 w-10" />
                              <p className="text-sm font-bold">AI Verification Successful</p>
                              <p className="text-[10px] text-muted-foreground italic">Image discarded successfully</p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2 h-7 text-[10px]"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setIsAiVerified(false);
                                  form.setValue('donorName', '');
                                  form.setValue('amount', '');
                                }}
                              >
                                Scan Different Receipt
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-8 w-8 text-muted-foreground" />
                              <Input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                {...field}
                              />
                              <p className="text-sm font-medium text-muted-foreground">
                                Upload receipt to auto-fill
                              </p>
                              <div className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                <Sparkles className="h-3 w-3" /> Save Storage & Verify
                              </div>
                            </>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="donorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" className="h-11" {...field} />
                      </FormControl>
                      <FormDescription>
                        As shown on the deposit receipt.
                      </FormDescription>
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
                          <Input placeholder="0.00" className="h-11" {...field} />
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
                            <SelectTrigger className="h-11">
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
                
                <Button type="submit" className="w-full h-12 text-lg bg-primary" disabled={isSubmitting || isScanning}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : "Submit Donation"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="justify-center border-t py-4 bg-muted/20">
            <Link href="/login" className="text-xs text-muted-foreground hover:text-primary underline flex items-center gap-1">
               Admin Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
