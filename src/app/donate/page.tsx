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
import { Church, QrCode, CheckCircle2, Loader2, Info, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
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
  referenceNumber: z.string().min(3, "Reference or QR number is required"),
});

export default function PublicDonatePage() {
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
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
      referenceNumber: "",
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
          setScanError("Verification Failed: This QR/Digital receipt was not sent to MUGHER FULL GOSPEL CHURCH (Account: 1000221935978).");
        } else {
          if (result.donorName) {
            form.setValue('donorName', result.donorName, { shouldValidate: true });
          }
          if (result.amount > 0) {
            form.setValue('amount', result.amount.toString(), { shouldValidate: true });
          }
          if (result.qrNumber) {
            form.setValue('referenceNumber', result.qrNumber, { shouldValidate: true });
          }
          setIsAiVerified(true);
          if (e.target) e.target.value = ''; 
        }
      } catch (err) {
        console.error("AI Scan failed", err);
        setScanError("AI could not read the image. Please enter details manually.");
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    setIsSubmitting(true);

    const donationData = {
      donorName: values.donorName,
      amount: Number(values.amount),
      type: values.type,
      receiptData: null,
      isAiVerified: isAiVerified,
      status: 'pending',
      referenceNumber: values.referenceNumber,
      timestamp: serverTimestamp(),
    };

    addDoc(collection(firestore, 'donations'), donationData)
      .then(() => {
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
      <div className="min-h-[100svh] bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6 md:p-8 animate-in fade-in zoom-in duration-300 rounded-2xl">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-100 p-4 rounded-full">
              <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 text-emerald-600" />
            </div>
          </div>
          <CardTitle className="text-xl md:text-2xl font-headline mb-2 text-primary">Verification Logged</CardTitle>
          <CardDescription className="text-sm md:text-base mb-6">
            Thank you! Your donation has been recorded. Our finance team will verify the transaction ID.
          </CardDescription>
          <div className="bg-muted p-4 rounded-xl mb-8">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Reference Number</p>
            <p className="text-lg md:text-xl font-mono font-bold text-primary">{form.getValues('referenceNumber')}</p>
          </div>
          <Button asChild className="w-full bg-primary h-12 rounded-xl font-bold uppercase tracking-widest text-xs">
            <Link href="/">Return Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-background py-8 md:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center gap-2 mb-8 text-center">
          <Church className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          <h1 className="text-xl md:text-2xl font-headline font-bold text-primary uppercase">MUGHER FULL GOSPEL CHURCH</h1>
        </div>

        <Alert className="mb-6 bg-primary/5 border-primary/20 shadow-sm rounded-xl">
          <Info className="h-5 w-5 text-primary" />
          <AlertTitle className="text-primary font-bold uppercase tracking-tight text-xs md:text-sm">Official Account</AlertTitle>
          <AlertDescription className="text-[11px] md:text-sm font-medium leading-relaxed">
            Please transfer to our verified church account:
            <span className="block mt-2 p-3 bg-white border rounded-lg font-bold text-base md:text-lg text-primary tracking-widest shadow-inner text-center">
              1000221935978
            </span>
            <span className="text-muted-foreground italic font-bold uppercase mt-2 block text-center text-[10px] md:text-xs">MUGHER FULL GOSPEL CHURCH</span>
          </AlertDescription>
        </Alert>

        {scanError && (
          <Alert variant="destructive" className="mb-6 animate-in fade-in slide-in-from-top-2 rounded-xl">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-xs md:text-sm font-bold">Validation Alert</AlertTitle>
            <AlertDescription className="text-[10px] md:text-xs">{scanError}</AlertDescription>
          </Alert>
        )}

        <Card className="border-none shadow-xl rounded-2xl">
          <CardHeader className="p-6 md:p-8">
            <CardTitle className="text-lg md:text-xl font-headline text-primary">QR / Reference Verification</CardTitle>
            <CardDescription className="text-[11px] md:text-xs">
              Upload a screenshot of your digital receipt or QR summary. Our AI will automatically extract the QR Number and details.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 md:px-8 pb-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Automated QR Number Scan</label>
                <div className={`border-2 border-dashed rounded-xl p-6 md:p-10 flex flex-col items-center justify-center gap-3 transition-all relative ${isAiVerified ? 'bg-emerald-50 border-emerald-200' : 'bg-muted/30 hover:bg-muted/50 border-primary/20'} ${isScanning ? 'opacity-50 pointer-events-none' : ''}`}>
                  {isScanning ? (
                    <div className="flex flex-col items-center gap-3 text-primary text-center">
                      <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin" />
                      <div className="space-y-1">
                        <p className="text-[11px] md:text-sm font-bold uppercase tracking-widest animate-pulse">Scanning QR Data...</p>
                        <p className="text-[9px] text-muted-foreground">Extracting Reference ID</p>
                      </div>
                    </div>
                  ) : isAiVerified ? (
                    <div className="flex flex-col items-center gap-3 text-emerald-600 animate-in zoom-in duration-300 text-center">
                      <div className="bg-emerald-100 p-3 rounded-full">
                        <ShieldCheck className="h-8 w-8 md:h-10 md:w-10" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] md:text-sm font-bold uppercase tracking-widest">QR Verified Secure</p>
                        <p className="text-[9px] text-muted-foreground italic">Transaction ID extracted</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 h-8 text-[9px] border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg px-4"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsAiVerified(false);
                          form.reset();
                        }}
                      >
                        Scan Different Receipt
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-primary/5 p-4 rounded-full">
                        <QrCode className="h-6 w-6 md:h-8 md:w-8 text-primary/60" />
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="text-center space-y-1">
                        <p className="text-[11px] md:text-sm font-bold text-muted-foreground">
                          Upload digital receipt screenshot
                        </p>
                        <p className="text-[9px] text-muted-foreground">Telebirr, CBE Birr, or Banking App</p>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] bg-primary text-white px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-sm">
                        <Sparkles className="h-2.5 w-2.5" /> AI Scan
                      </div>
                    </>
                  )}
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider">Donor Full Name</label>
                  <Input placeholder="Enter your full name" className="h-12 bg-white rounded-lg text-sm" {...form.register('donorName')} />
                  {form.formState.errors.donorName && <p className="text-[10px] text-rose-500">{form.formState.errors.donorName.message}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider">Amount (ETB)</label>
                    <Input placeholder="0.00" className="h-12 bg-white rounded-lg text-sm" {...form.register('amount')} />
                    {form.formState.errors.amount && <p className="text-[10px] text-rose-500">{form.formState.errors.amount.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider">Category</label>
                    <Select onValueChange={(val) => form.setValue('type', val as any)} defaultValue={form.getValues('type')}>
                      <SelectTrigger className="h-12 bg-white rounded-lg text-sm">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tithe">Tithe</SelectItem>
                        <SelectItem value="Offering">Offering</SelectItem>
                        <SelectItem value="GoFund">GoFund</SelectItem>
                        <SelectItem value="Special Seed">Special Seed</SelectItem>
                        <SelectItem value="Building Purposes">Building Purposes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider">QR / Reference Number</label>
                  <Input placeholder="e.g. FT240..." className="h-12 bg-white rounded-lg text-sm font-mono" {...form.register('referenceNumber')} />
                  {form.formState.errors.referenceNumber && <p className="text-[10px] text-rose-500">{form.formState.errors.referenceNumber.message}</p>}
                </div>
                
                <Button type="submit" className="w-full h-14 text-base md:text-lg font-bold bg-primary uppercase tracking-widest shadow-lg rounded-xl transition-transform active:scale-95" disabled={isSubmitting || isScanning}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...
                    </>
                  ) : "Confirm & Submit"}
                </Button>
              </form>
            </div>
          </CardContent>
          <CardFooter className="justify-center border-t py-6 bg-muted/20 rounded-b-2xl">
            <Link href="/login" className="text-[10px] md:text-xs text-muted-foreground hover:text-primary underline flex items-center gap-1 font-medium tracking-wide">
               Admin Dashboard Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
