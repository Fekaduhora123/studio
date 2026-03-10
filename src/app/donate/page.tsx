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
import { Church, QrCode, CheckCircle2, Loader2, Info, Sparkles, AlertTriangle, ShieldCheck, Image as ImageIcon } from 'lucide-react';
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

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setScanError(null);
    setIsAiVerified(false);
    setIsScanning(true);
    
    try {
      const compressedDataUri = await compressImage(file);
      const result = await scanReceipt({ receiptDataUri: compressedDataUri });
      
      if (!result.isCorrectAccount) {
        setScanError("Verification Failed: Destination account mismatch.");
      } else {
        if (result.donorName) form.setValue('donorName', result.donorName, { shouldValidate: true });
        if (result.amount > 0) form.setValue('amount', result.amount.toString(), { shouldValidate: true });
        if (result.qrNumber) form.setValue('referenceNumber', result.qrNumber, { shouldValidate: true });
        setIsAiVerified(true);
      }
    } catch (err) {
      setScanError("Unable to process the image. Please try again.");
    } finally {
      setIsScanning(false);
      if (e.target) e.target.value = ''; 
    }
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
      .catch(async () => {
        setIsSubmitting(false);
      });
  }

  if (!mounted) return null;

  if (submitted) {
    return (
      <div className="min-h-[100svh] bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6 md:p-8 rounded-2xl shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-100 p-4 rounded-full">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
          </div>
          <CardTitle className="text-xl md:text-2xl font-headline mb-2 text-primary">Log Recorded</CardTitle>
          <CardDescription className="text-sm md:text-base mb-6">
            Your donation has been logged for audit. Reference ID: 
            <span className="block mt-2 font-mono font-bold text-primary">{form.getValues('referenceNumber')}</span>
          </CardDescription>
          <Button asChild className="w-full bg-primary h-12 rounded-xl font-bold uppercase tracking-widest text-xs">
            <Link href="/">Return Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-background py-6 md:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center gap-2 mb-6 md:mb-8 text-center">
          <Church className="h-8 w-8 text-primary" />
          <h1 className="text-lg md:text-2xl font-headline font-bold text-primary uppercase">MUGHER FULL GOSPEL</h1>
        </div>

        <Alert className="mb-6 bg-primary/5 border-primary/20 shadow-sm rounded-xl">
          <Info className="h-5 w-5 text-primary" />
          <AlertTitle className="text-primary font-bold uppercase tracking-tight text-[10px] md:text-sm text-center mb-2">Transfer Account</AlertTitle>
          <AlertDescription className="text-center">
            <span className="block p-3 bg-white border rounded-lg font-bold text-base md:text-xl text-primary tracking-widest shadow-inner">
              1000221935978
            </span>
            <span className="text-muted-foreground italic font-bold uppercase mt-2 block text-[9px] md:text-xs">MUGHER FULL GOSPEL CHURCH</span>
          </AlertDescription>
        </Alert>

        {scanError && (
          <Alert variant="destructive" className="mb-6 rounded-xl">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-[10px] md:text-xs">{scanError}</AlertDescription>
          </Alert>
        )}

        <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="p-6 md:p-8 bg-muted/10">
            <CardTitle className="text-lg md:text-xl font-headline text-primary">Transaction Logging</CardTitle>
            <CardDescription className="text-[11px] md:text-xs">
              Upload your transaction screenshot for AI-powered verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mobile Receipt Scan (AI)</label>
                <div className={`border-2 border-dashed rounded-xl p-6 md:p-10 flex flex-col items-center justify-center gap-3 transition-all relative ${isAiVerified ? 'bg-emerald-50 border-emerald-200' : 'bg-muted/30 hover:bg-muted/50 border-primary/20'} ${isScanning ? 'opacity-50 pointer-events-none' : ''}`}>
                  {isScanning ? (
                    <div className="flex flex-col items-center gap-3 text-primary text-center">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest animate-pulse">Scanning...</p>
                    </div>
                  ) : isAiVerified ? (
                    <div className="flex flex-col items-center gap-3 text-emerald-600 text-center">
                      <ShieldCheck className="h-10 w-10" />
                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Verified Match</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 text-primary/40" />
                      <Input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="text-center">
                        <p className="text-[10px] md:text-sm font-bold text-muted-foreground">Upload Screenshot</p>
                        <p className="text-[8px] md:text-[10px] text-muted-foreground">Telebirr / CBE Birr / QR</p>
                      </div>
                      <div className="flex items-center gap-2 text-[8px] bg-primary text-white px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                        <Sparkles className="h-2.5 w-2.5" /> AI AUTO-SCAN
                      </div>
                    </>
                  )}
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Donor Name</label>
                  <Input placeholder="Enter sender name" className="h-12 bg-white rounded-lg text-sm" {...form.register('donorName')} />
                  {form.formState.errors.donorName && <p className="text-[10px] text-rose-500">{form.formState.errors.donorName.message}</p>}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Amount (ETB)</label>
                    <Input placeholder="0.00" className="h-12 bg-white rounded-lg text-sm" {...form.register('amount')} />
                    {form.formState.errors.amount && <p className="text-[10px] text-rose-500">{form.formState.errors.amount.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Donation Type</label>
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
                  <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">QR / Transaction ID</label>
                  <Input placeholder="e.g. FT24..." className="h-12 bg-white rounded-lg text-sm font-mono" {...form.register('referenceNumber')} />
                </div>
                
                <Button type="submit" className="w-full h-14 text-base font-bold bg-primary uppercase tracking-widest shadow-lg rounded-xl" disabled={isSubmitting || isScanning}>
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Log Contribution"}
                </Button>
              </form>
            </div>
          </CardContent>
          <CardFooter className="justify-center border-t py-4 bg-muted/20">
            <Link href="/login" className="text-[10px] text-muted-foreground hover:text-primary underline font-medium">
               Admin Dashboard
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}