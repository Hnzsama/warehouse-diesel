<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        try {
            $query = User::with('roles');

            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($request->filled('role')) {
                $role = $request->input('role');
                $query->whereHas('roles', function ($q) use ($role) {
                    $q->where('name', $role);
                });
            }

            $users = $query->orderBy('name')->paginate(10)->withQueryString();
            $roles = Role::all(['id', 'name']);

            return Inertia::render('Users/Index', [
                'users' => $users,
                'roles' => $roles,
                'filters' => $request->only(['search', 'role']),
            ]);
        } catch (\Throwable $e) {
            return Inertia::render('Users/Index', [
                'users' => User::with('roles')->paginate(10)->withQueryString(),
                'roles' => Role::all(['id', 'name']),
                'filters' => [],
            ]);
        }
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'string', Password::defaults()],
            'role' => 'required|string|in:admin,staf_operasional,admin_qc,pemilik',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                $user = User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                ]);

                $user->assignRole($validated['role']);
            });

            return redirect()->back()->with('success', "Pengguna {$validated['name']} berhasil ditambahkan.");
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Gagal menambahkan pengguna baru: '.$e->getMessage());
        }
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'password' => ['nullable', 'string', Password::defaults()],
            'role' => 'required|string|in:admin,staf_operasional,admin_qc,pemilik',
        ]);

        try {
            DB::transaction(function () use ($user, $validated) {
                $user->name = $validated['name'];
                $user->email = $validated['email'];

                if (! empty($validated['password'])) {
                    $user->password = Hash::make($validated['password']);
                }

                $user->save();
                $user->syncRoles([$validated['role']]);
            });

            return redirect()->back()->with('success', "Data pengguna {$user->name} berhasil diperbarui.");
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Gagal memperbarui pengguna: '.$e->getMessage());
        }
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        try {
            DB::transaction(function () use ($user) {
                $user->delete();
            });

            return redirect()->back()->with('success', "Pengguna {$user->name} telah berhasil dihapus.");
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Gagal menghapus pengguna: '.$e->getMessage());
        }
    }
}
