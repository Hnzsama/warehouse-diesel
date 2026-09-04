export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles?: string[];
    is_admin?: boolean;
    is_pemilik?: boolean;
    is_staf?: boolean;
    is_qc?: boolean;
    role_label?: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type SharedData = {
    name: string;
    auth: Auth;
    flash?: {
        success?: string | null;
        error?: string | null;
    };
    [key: string]: unknown;
};
