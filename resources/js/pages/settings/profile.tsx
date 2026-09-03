import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Camera, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import AvatarCropperModal from '@/components/avatar-cropper-modal';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import type { Auth } from '@/types';
import { send } from '@/routes/verification';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user as any;

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url);

    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        avatar: '',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result as string);
                setIsCropperOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCroppedAvatar = (base64Cropped: string) => {
        setAvatarPreview(base64Cropped);
        setData('avatar', base64Cropped);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/settings/profile', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Pengaturan Profil Pengguna" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Pengaturan Profil"
                    description="Perbarui foto profil, nama lengkap, dan alamat email Anda."
                />

                {/* Avatar Profile Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-border bg-card shadow-xs">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <img
                            src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&color=F43F5E&background=18181B`}
                            alt={user.name}
                            className="h-24 w-24 rounded-full object-cover border-2 border-primary/40 shadow-sm transition-opacity group-hover:opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-7 w-7 text-white" />
                        </div>
                    </div>

                    <div className="space-y-2 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="gap-2 cursor-pointer text-xs"
                            >
                                <Upload className="h-3.5 w-3.5" />
                                <span>Pilih Foto Profil (1:1)</span>
                            </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Format yang didukung: JPG, PNG, atau WebP. Foto akan dipotong dengan rasio 1:1.
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Form Profile Details */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama Lengkap *</Label>
                        <Input
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                            placeholder="Nama Lengkap"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Alamat Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            className="mt-1 block w-full"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="Alamat Email"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div>
                            <p className="text-muted-foreground -mt-4 text-sm">
                                Email Anda belum diverifikasi.{' '}
                                <Link
                                    href={send()}
                                    as="button"
                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                >
                                    Klik di sini untuk mengirim ulang email verifikasi.
                                </Link>
                            </p>

                            {status === 'verification-link-sent' && (
                                <div className="mt-2 text-sm font-medium text-green-600">
                                    Link verifikasi baru telah dikirimkan ke alamat email Anda.
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <Button disabled={processing} className="cursor-pointer font-bold">
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Avatar Cropper Modal */}
            <AvatarCropperModal
                open={isCropperOpen}
                onOpenChange={setIsCropperOpen}
                imageSrc={selectedImage}
                onCropComplete={handleCroppedAvatar}
            />

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan Profil',
            href: edit(),
        },
    ],
};
