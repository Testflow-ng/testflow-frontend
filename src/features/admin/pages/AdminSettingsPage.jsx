import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Settings, Save, AlertTriangle, Info } from 'lucide-react';
import { adminApi } from '../api.js';
import { Button, Card, Field, Input, Spinner, Alert } from '../../../components/ui/index.js';
import { useState, useEffect } from 'react';

function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: adminApi.getSettings,
  });

  const { register, handleSubmit, reset, formState: { isDirty, isSubmitting } } = useForm();

  useEffect(() => {
    if (settings) {
      reset({
        isPostUtmeActive: settings.isPostUtmeActive,
        postUtmePrice: settings.postUtmePrice,
        paymentAccountNumber: settings.paymentAccountNumber,
        paymentBankName: settings.paymentBankName,
        paymentAccountName: settings.paymentAccountName,
      });
    }
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: adminApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries(['adminSettings']);
      queryClient.invalidateQueries(['publicConfig']);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({
        ...data,
        postUtmePrice: Number(data.postUtmePrice)
    });
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (isError) return <Alert variant="danger">Failed to load platform settings.</Alert>;

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong sm:text-3xl flex items-center gap-3">
          <Settings size={28} className="text-primary" />
          Platform Settings
        </h1>
        <p className="mt-2 text-sm text-muted">
          Configure global Post-UTME parameters and payment information.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {success && <Alert variant="success">Settings updated successfully.</Alert>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card className="p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground-strong mb-6 flex items-center gap-2">
                 <Info size={16} className="text-primary" />
                 General Configuration
              </h3>

              <div className="space-y-5">
                 <div className="flex items-center justify-between p-4 rounded-xl bg-surface-strong border border-border">
                    <div>
                       <p className="text-xs font-bold text-foreground-strong">Post-UTME Activation</p>
                       <p className="text-[10px] text-muted">Enable or disable the entire Post-UTME vault.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            {...register('isPostUtmeActive')}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                 </div>

                 <Field label="Post-UTME Price (₦)">
                    <Input
                        type="number"
                        {...register('postUtmePrice')}
                        placeholder="2000"
                    />
                 </Field>
              </div>
           </Card>

           <Card className="p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground-strong mb-6 flex items-center gap-2">
                 <AlertTriangle size={16} className="text-amber-500" />
                 Payment Information
              </h3>
              <p className="text-[10px] text-muted mb-6 -mt-4 italic">
                 These details are displayed to students on the Lock Screen.
              </p>

              <div className="space-y-4">
                 <Field label="Bank Name">
                    <Input {...register('paymentBankName')} placeholder="e.g. Opay" />
                 </Field>
                 <Field label="Account Number">
                    <Input {...register('paymentAccountNumber')} placeholder="0123456789" />
                 </Field>
                 <Field label="Account Name">
                    <Input {...register('paymentAccountName')} placeholder="e.g. Oluwadare Daniel" />
                 </Field>
              </div>
           </Card>
        </div>

        <div className="flex justify-end pt-4">
           <Button
              type="submit"
              size="lg"
              disabled={!isDirty || isSubmitting}
              loading={isSubmitting}
              leadingIcon={<Save size={18} />}
              className="px-8 shadow-xl shadow-primary/20"
           >
              Save Changes
           </Button>
        </div>
      </form>
    </div>
  );
}

export default AdminSettingsPage;
