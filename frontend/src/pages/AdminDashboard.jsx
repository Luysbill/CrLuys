import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    LogOut,
    Plus,
    Pencil,
    Trash2,
    Users,
    Mail,
    Package,
    Sparkles,
    X,
    Save,
    Target,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { apiClient, CATEGORIES, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";

const EMPTY_PRODUCT = {
    title: "",
    slug: "",
    category: CATEGORIES[0].slug,
    headline: "",
    short_description: "",
    long_description: "",
    price: 0,
    image_url: "",
    affiliate_url: "",
    benefits_text: "",
    rating: 4.9,
    reviews_count: 0,
    featured: false,
    start_here: false,
    is_active: true,
    order: 0,
};

function ProductForm({ initial, onCancel, onSaved }) {
    const [form, setForm] = useState({
        ...EMPTY_PRODUCT,
        ...(initial || {}),
        benefits_text: initial?.benefits?.join("\n") || "",
    });
    const [saving, setSaving] = useState(false);
    const isEdit = Boolean(initial?.id);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = {
            ...form,
            price: parseFloat(form.price) || 0,
            rating: parseFloat(form.rating) || 4.9,
            reviews_count: parseInt(form.reviews_count) || 0,
            order: parseInt(form.order) || 0,
            benefits: form.benefits_text
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
        };
        delete payload.benefits_text;
        try {
            if (isEdit) {
                const { data } = await apiClient.put(
                    `/admin/products/${initial.id}`,
                    payload
                );
                toast.success("Product updated");
                onSaved(data);
            } else {
                const { data } = await apiClient.post("/admin/products", payload);
                toast.success("Product created");
                onSaved(data);
            }
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            data-testid="product-form-modal"
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
            <form
                onSubmit={onSubmit}
                className="w-full max-w-3xl bg-ink-100 border border-gold/25 rounded-3xl p-8 space-y-5 my-10 max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between">
                    <h3 className="font-serif text-3xl text-cream">
                        {isEdit ? "Edit Product" : "New Product"}
                    </h3>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-gold/30 text-cream"
                        data-testid="form-close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Title" name="title" value={form.title} onChange={onChange} required />
                    <Field
                        label="Slug (lowercase-hyphens)"
                        name="slug"
                        value={form.slug}
                        onChange={onChange}
                        placeholder="auto-generated if empty"
                    />
                    <div>
                        <label className="text-xs uppercase tracking-[0.25em] text-cream/60 mb-2 block">
                            Category
                        </label>
                        <select
                            name="category"
                            value={form.category}
                            onChange={onChange}
                            data-testid="form-category"
                            className="w-full bg-ink-50 border border-gold/25 text-cream rounded-xl px-3 py-2.5"
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c.slug} value={c.slug}>
                                    {`${c.number} — ${c.short}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Field
                        label="Price (USD)"
                        name="price"
                        type="number"
                        step="0.01"
                        value={form.price}
                        onChange={onChange}
                    />
                </div>

                <Field
                    label="Headline (premium tagline)"
                    name="headline"
                    value={form.headline}
                    onChange={onChange}
                />
                <Field
                    label="Short description (card preview)"
                    name="short_description"
                    value={form.short_description}
                    onChange={onChange}
                />
                <div>
                    <label className="text-xs uppercase tracking-[0.25em] text-cream/60 mb-2 block">
                        Long description
                    </label>
                    <textarea
                        name="long_description"
                        rows={4}
                        value={form.long_description}
                        onChange={onChange}
                        className="w-full bg-ink-50 border border-gold/25 text-cream rounded-xl px-3 py-2.5 resize-none"
                    />
                </div>

                <Field
                    label="Image URL"
                    name="image_url"
                    value={form.image_url}
                    onChange={onChange}
                />
                <Field
                    label="Affiliate URL"
                    name="affiliate_url"
                    value={form.affiliate_url}
                    onChange={onChange}
                />

                <div>
                    <label className="text-xs uppercase tracking-[0.25em] text-cream/60 mb-2 block">
                        Benefits (one per line)
                    </label>
                    <textarea
                        name="benefits_text"
                        rows={4}
                        value={form.benefits_text}
                        onChange={onChange}
                        className="w-full bg-ink-50 border border-gold/25 text-cream rounded-xl px-3 py-2.5 resize-none"
                        data-testid="form-benefits"
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Field
                        label="Rating"
                        name="rating"
                        type="number"
                        step="0.1"
                        value={form.rating}
                        onChange={onChange}
                    />
                    <Field
                        label="Reviews"
                        name="reviews_count"
                        type="number"
                        value={form.reviews_count}
                        onChange={onChange}
                    />
                    <Field
                        label="Order"
                        name="order"
                        type="number"
                        value={form.order}
                        onChange={onChange}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-5 pt-1">
                    <Toggle
                        label="Featured"
                        name="featured"
                        checked={form.featured}
                        onChange={onChange}
                    />
                    <Toggle
                        label="Start Here"
                        name="start_here"
                        checked={form.start_here}
                        onChange={onChange}
                    />
                    <Toggle
                        label="Active"
                        name="is_active"
                        checked={form.is_active}
                        onChange={onChange}
                    />
                </div>

                <div className="flex items-center gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        data-testid="form-save"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-ink hover:bg-gold-light transition-colors disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        <span className="text-sm uppercase tracking-[0.25em] font-medium">
                            {saving ? "Saving…" : "Save"}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 rounded-full border border-gold/30 text-cream hover:text-gold transition-colors text-sm uppercase tracking-[0.25em]"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

const Field = ({ label, ...props }) => (
    <div>
        <label className="text-xs uppercase tracking-[0.25em] text-cream/60 mb-2 block">
            {label}
        </label>
        <input
            {...props}
            data-testid={`form-${props.name}`}
            className="w-full bg-ink-50 border border-gold/25 text-cream rounded-xl px-3 py-2.5 font-light outline-none focus:border-gold"
        />
    </div>
);

const Toggle = ({ label, name, checked, onChange }) => (
    <label className="inline-flex items-center gap-3 cursor-pointer">
        <input
            type="checkbox"
            name={name}
            checked={!!checked}
            onChange={onChange}
            data-testid={`form-toggle-${name}`}
            className="h-4 w-4 accent-[#D4AF37]"
        />
        <span className="text-sm text-cream uppercase tracking-[0.2em]">{label}</span>
    </label>
);

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState("products");
    const [products, setProducts] = useState([]);
    const [subs, setSubs] = useState([]);
    const [messages, setMessages] = useState([]);
    const [leads, setLeads] = useState([]);
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [p, s, m, l] = await Promise.all([
                apiClient.get("/admin/products"),
                apiClient.get("/admin/subscribers"),
                apiClient.get("/admin/messages"),
                apiClient.get("/admin/leads"),
            ]);
            setProducts(p.data);
            setSubs(s.data);
            setMessages(m.data);
            setLeads(l.data);
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const onDelete = async (p) => {
        if (!window.confirm(`Delete "${p.title}"?`)) return;
        try {
            await apiClient.delete(`/admin/products/${p.id}`);
            toast.success("Product deleted");
            setProducts((arr) => arr.filter((x) => x.id !== p.id));
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail));
        }
    };

    const onSaved = (saved) => {
        setProducts((arr) => {
            const exists = arr.find((p) => p.id === saved.id);
            return exists
                ? arr.map((p) => (p.id === saved.id ? saved : p))
                : [saved, ...arr];
        });
        setEditing(null);
        setCreating(false);
    };

    const stats = [
        { label: "Products", value: products.length, icon: Package },
        { label: "Leads", value: leads.length, icon: Target },
        { label: "Subscribers", value: subs.length, icon: Users },
        { label: "Messages", value: messages.length, icon: Mail },
    ];

    return (
        <main
            data-testid="admin-dashboard"
            className="min-h-screen pt-32 pb-32"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.5em] text-gold/85 mb-3">
                            Control Room
                        </p>
                        <h1 className="font-serif text-5xl text-cream tracking-tight">
                            CrLuys <span className="italic gold-gradient-text">Admin</span>
                        </h1>
                        {user && (
                            <p className="text-cream/55 mt-2 text-sm">
                                Signed in as {user.email}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={async () => {
                            await logout();
                            navigate("/admin/login");
                        }}
                        data-testid="admin-logout"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-gold/30 text-cream hover:bg-gold hover:text-ink transition-colors text-sm uppercase tracking-[0.25em]"
                    >
                        <LogOut className="h-4 w-4" /> Sign out
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {stats.map((s) => (
                        <div
                            key={s.label}
                            className="bg-ink-100 border border-gold/15 rounded-2xl p-6"
                            data-testid={`stat-${s.label.toLowerCase()}`}
                        >
                            <s.icon className="h-4 w-4 text-gold mb-3" />
                            <p className="font-serif text-4xl text-cream">{s.value}</p>
                            <p className="text-xs uppercase tracking-[0.25em] text-cream/55 mt-1">
                                {s.label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar">
                    {[
                        { key: "products", label: "Products" },
                        { key: "leads", label: "Leads" },
                        { key: "subscribers", label: "Subscribers" },
                        { key: "messages", label: "Messages" },
                    ].map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            data-testid={`tab-${t.key}`}
                            className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.3em] transition-colors whitespace-nowrap ${
                                tab === t.key
                                    ? "bg-gold text-ink"
                                    : "border border-gold/25 text-cream/70 hover:text-gold"
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Products */}
                {tab === "products" && (
                    <section data-testid="admin-products">
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => setCreating(true)}
                                data-testid="add-product"
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gold text-ink hover:bg-gold-light transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="text-sm uppercase tracking-[0.25em] font-medium">
                                    New product
                                </span>
                            </button>
                        </div>
                        {loading ? (
                            <p className="text-cream/60">Loading…</p>
                        ) : (
                            <div className="bg-ink-100 border border-gold/15 rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="text-cream/55 uppercase tracking-[0.2em] text-xs border-b border-gold/15">
                                            <tr>
                                                <th className="p-4">Product</th>
                                                <th className="p-4">Category</th>
                                                <th className="p-4">Price</th>
                                                <th className="p-4">Flags</th>
                                                <th className="p-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map((p) => {
                                                const cat = CATEGORIES.find(
                                                    (c) => c.slug === p.category
                                                );
                                                return (
                                                    <tr
                                                        key={p.id}
                                                        data-testid={`product-row-${p.slug}`}
                                                        className="border-b border-gold/10 hover:bg-ink-50/30 transition-colors"
                                                    >
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={p.image_url}
                                                                    alt=""
                                                                    className="h-12 w-12 rounded-lg object-cover bg-ink-50"
                                                                />
                                                                <div className="min-w-0">
                                                                    <p className="font-serif text-lg text-cream truncate">
                                                                        {p.title}
                                                                    </p>
                                                                    <p className="text-xs text-cream/45 truncate">
                                                                        /{p.slug}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-cream/70">
                                                            {cat?.short}
                                                        </td>
                                                        <td className="p-4 text-gold font-serif text-lg">
                                                            ${p.price?.toFixed(2)}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex gap-1 flex-wrap">
                                                                {p.featured && (
                                                                    <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-[10px] uppercase tracking-[0.2em]">
                                                                        Featured
                                                                    </span>
                                                                )}
                                                                {p.start_here && (
                                                                    <span className="px-2 py-0.5 rounded-full bg-gold text-ink text-[10px] uppercase tracking-[0.2em]">
                                                                        Start
                                                                    </span>
                                                                )}
                                                                {!p.is_active && (
                                                                    <span className="px-2 py-0.5 rounded-full bg-red-700/30 text-red-300 text-[10px] uppercase tracking-[0.2em]">
                                                                        Inactive
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <div className="inline-flex gap-2">
                                                                <button
                                                                    onClick={() =>
                                                                        setEditing(p)
                                                                    }
                                                                    data-testid={`edit-${p.slug}`}
                                                                    className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-gold/30 text-cream hover:bg-gold hover:text-ink transition-colors"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => onDelete(p)}
                                                                    data-testid={`delete-${p.slug}`}
                                                                    className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-red-700/30 text-red-300 hover:bg-red-700 hover:text-cream transition-colors"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {tab === "leads" && (
                    <section data-testid="admin-leads" className="space-y-4">
                        {leads.length === 0 ? (
                            <p className="text-cream/55">No leads yet — onboarding modal will capture them.</p>
                        ) : (
                            <div className="bg-ink-100 border border-gold/15 rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="text-cream/55 uppercase tracking-[0.2em] text-xs border-b border-gold/15">
                                            <tr>
                                                <th className="p-4">Email</th>
                                                <th className="p-4">Name</th>
                                                <th className="p-4">Goal</th>
                                                <th className="p-4">Source · CTA</th>
                                                <th className="p-4">Captured</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leads.map((l) => (
                                                <tr
                                                    key={l.id}
                                                    className="border-b border-gold/10"
                                                    data-testid={`lead-row-${l.id}`}
                                                >
                                                    <td className="p-4 text-cream">{l.email}</td>
                                                    <td className="p-4 text-cream/70">{l.name || "—"}</td>
                                                    <td className="p-4">
                                                        {l.goal ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/15 text-gold text-[10px] uppercase tracking-[0.2em]">
                                                                {l.goal.replace(/-/g, " ")}
                                                            </span>
                                                        ) : (
                                                            <span className="text-cream/40">—</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-cream/55 text-xs">
                                                        <p className="uppercase tracking-[0.2em]">{l.source}</p>
                                                        <p className="text-cream/40 mt-0.5">{l.cta || "—"}</p>
                                                    </td>
                                                    <td className="p-4 text-cream/55">
                                                        {new Date(l.created_at).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {tab === "subscribers" && (
                    <section data-testid="admin-subscribers">
                        <div className="bg-ink-100 border border-gold/15 rounded-2xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="text-cream/55 uppercase tracking-[0.2em] text-xs border-b border-gold/15">
                                    <tr>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subs.length === 0 ? (
                                        <tr>
                                            <td colSpan={2} className="p-6 text-cream/55">
                                                No subscribers yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        subs.map((s, i) => (
                                            <tr
                                                key={i}
                                                className="border-b border-gold/10"
                                                data-testid={`subscriber-row-${i}`}
                                            >
                                                <td className="p-4 text-cream">{s.email}</td>
                                                <td className="p-4 text-cream/55">
                                                    {new Date(
                                                        s.created_at
                                                    ).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {tab === "messages" && (
                    <section data-testid="admin-messages" className="space-y-4">
                        {messages.length === 0 ? (
                            <p className="text-cream/55">No messages yet.</p>
                        ) : (
                            messages.map((m) => (
                                <div
                                    key={m.id}
                                    data-testid={`message-${m.id}`}
                                    className="bg-ink-100 border border-gold/15 rounded-2xl p-6"
                                >
                                    <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                                        <div>
                                            <p className="font-serif text-xl text-cream">
                                                {m.name}
                                            </p>
                                            <p className="text-sm text-gold">{m.email}</p>
                                        </div>
                                        <p className="text-xs text-cream/45 uppercase tracking-[0.25em]">
                                            {new Date(m.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <p className="text-cream/75 font-light leading-relaxed whitespace-pre-line">
                                        {m.message}
                                    </p>
                                </div>
                            ))
                        )}
                    </section>
                )}
            </div>

            {(creating || editing) && (
                <ProductForm
                    initial={editing}
                    onCancel={() => {
                        setCreating(false);
                        setEditing(null);
                    }}
                    onSaved={onSaved}
                />
            )}
        </main>
    );
}
