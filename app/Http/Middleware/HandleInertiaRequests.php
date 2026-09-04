<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'roles' => $user->getRoleNames(),
                    'is_admin' => $user->hasRole('admin'),
                    'is_pemilik' => $user->hasRole('pemilik'),
                    'is_staf' => $user->hasRole('staf_operasional'),
                    'is_qc' => $user->hasRole('admin_qc'),
                    'role_label' => match (true) {
                        $user->hasRole('pemilik') => 'Pemilik (Owner)',
                        $user->hasRole('admin') => 'Admin Utama',
                        $user->hasRole('staf_operasional') => 'Staf Operasional',
                        $user->hasRole('admin_qc') => 'Admin QC',
                        default => 'Pengguna',
                    },
                ]) : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
