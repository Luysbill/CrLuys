import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    LogOut,
    Plus,
    Pencil,
    Trash2,
    Users,
    Mail,
    Package,
    X,
    Save,
    Target,
    Link2,
    LinkIcon,
    ExternalLink,
    Eye,
    Check,
    AlertTriangle,
    Search,
    Star,
    Crown,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import {
    apiClient,
    CATEGORIES,
    formatApiErrorDetail,
    isValidHttpUrl,
    SMART_INVESTING_FLAGSHIP_SLUG,
} from "../lib/api";
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
    priority_order: 999,
};

const FLAGSHIP_WARNING = `Heads-up: "${SMART_INVESTING_FLAGSHIP_SLUG}" is the Smart Investing flagship and is already wired to the cinematic lead-capture modal → Keystone destination. Setting a custom affiliate URL here will override that flow. Continue?`;

// ============================================================
// PRODUCT FORM (full edit modal)
// ============================================================
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

        // URL validation
        const url = (form.affiliate_url || "").trim();
        if (url && !isValidHttpUrl(url)) {
            toast.error("Affiliate URL must start with http:// or https://");
            return;
        }

        // Flagship confirmation
        if (
            isEdit &&
            initial?.slug === SMART_INVESTING_FLAGSHIP_SLUG &&
            url &&
            url !== (initial?.affiliate_url || "")
        ) {
            if (!window.confirm(FLAGSHIP_WARNING)) return;
        }

        setSaving(true);
        const payload = {
            ...form,
            affiliate_url: url,
            price: parseFloat(form.price) || 0,
            rating: parseFloat(form.rating) || 4.9,
            reviews_count: parseInt(form.reviews_count) || 0,
            order: parseInt(form.order) || 0,
            priority_order: parseInt(form.priority_order) || 999,
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

    const affiliateInvalid =
        form.affiliate_url && !isValidHttpUrl(form.affiliate_url);

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

                <div>
                    <label className="text-xs uppercase tracking-[0.25em] text-cream/60 mb-2 block flex items-center gap-2">
                        Affiliate URL
                        {form.affiliate_url && !affiliateInvalid && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] normal-case tracking-normal">
                                <Check className="h-3 w-3" /> Valid
                            </span>
                        )}
                        {affiliateInvalid && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 text-[10px] normal-case tracking-normal">
                                <AlertTriangle className="h-3 w-3" /> Must start with https://
                            </span>
                        )}
                    </label>
                    <input
                        name="affiliate_url"
                        value={form.affiliate_url}
                        onChange={onChange}
                        placeholder="https://partner.example.com/?aff=YOUR_ID"
                        data-testid="form-affiliate_url"
                        className={`w-full bg-ink-50 border text-cream rounded-xl px-3 py-2.5 font-light outline-none focus:border-gold ${
                            affiliateInvalid ? "border-red-500/60" : "border-gold/25"
                        }`}
                    />
                </div>

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
                    <Field
                        label="Top Pick Rank (1–8, 999=off)"
                        name="priority_order"
                        type="number"
                        value={form.priority_order}
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

// ============================================================
// QUICK-EDIT AFFILIATE URL (inline row editor)
// ============================================================
function QuickEditAffiliate({ product, onSaved }) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(product.affiliate_url || "");
    const [saving, setSaving] = useState(false);
    const isFlagship = product.slug === SMART_INVESTING_FLAGSHIP_SLUG;
    const hasUrl = Boolean((product.affiliate_url || "").trim());

    useEffect(() => {
        setValue(product.affiliate_url || "");
    }, [product.affiliate_url]);

    const cancel = () => {
        setValue(product.affiliate_url || "");
        setEditing(false);
    };

    const save = async () => {
        const url = value.trim();
        if (url && !isValidHttpUrl(url)) {
            toast.error("URL must start with http:// or https://");
            return;
        }
        if (
            isFlagship &&
            url &&
            url !== (product.affiliate_url || "") &&
            !window.confirm(FLAGSHIP_WARNING)
        ) {
            return;
        }
        setSaving(true);
        try {
            const { data } = await apiClient.put(`/admin/products/${product.id}`, {
                affiliate_url: url,
            });
            toast.success(url ? "Affiliate URL saved" : "Affiliate URL cleared");
            onSaved(data);
            setEditing(false);
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail));
        } finally {
            setSaving(false);
        }
    };

    const onKey = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            save();
        } else if (e.key === "Escape") {
            cancel();
        }
    };

    if (editing) {
        return (
            <div
                className="flex items-center gap-2 min-w-[260px]"
                data-testid={`quick-edit-affiliate-${product.slug}`}
            >
                <input
                    autoFocus
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="https://partner.example.com/?aff=YOUR_ID"
                    data-testid={`quick-edit-input-${product.slug}`}
                    className="flex-1 bg-ink-50 border border-gold/40 text-cream rounded-lg px-2.5 py-1.5 text-xs font-light outline-none focus:border-gold"
                />
                <button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    data-testid={`quick-save-${product.slug}`}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-gold text-ink hover:bg-gold-light transition-colors disabled:opacity-50"
                    title="Save (Enter)"
                >
                    <Check className="h-3.5 w-3.5" />
                </button>
                <button
                    type="button"
                    onClick={cancel}
                    data-testid={`quick-cancel-${product.slug}`}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-gold/30 text-cream hover:text-gold transition-colors"
                    title="Cancel (Esc)"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 min-w-[200px]">
            {hasUrl ? (
                <>
                    <span
                        data-testid={`affiliate-status-${product.slug}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] uppercase tracking-[0.2em]"
                    >
                        <Check className="h-3 w-3" /> Linked
                    </span>
                    <a
                        href={product.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`test-affiliate-${product.slug}`}
                        className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-gold/30 text-cream hover:bg-gold hover:text-ink transition-colors"
                        title="Test affiliate link"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                </>
            ) : (
                <span
                    data-testid={`affiliate-status-${product.slug}`}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] ${
                        isFlagship
                            ? "bg-gold/15 text-gold"
                            : "bg-red-500/15 text-red-300"
                    }`}
                    title={
                        isFlagship
                            ? "Flagship — auto-redirects via cinematic modal to Keystone"
                            : "No affiliate URL yet — paste one to enable the public CTA"
                    }
                >
                    {isFlagship ? (
                        <>
                            <Crown className="h-3 w-3" /> Flagship
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="h-3 w-3" /> Not set
                        </>
                    )}
                </span>
            )}
            <button
                type="button"
                onClick={() => setEditing(true)}
                data-testid={`quick-edit-${product.slug}`}
                className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-gold/30 text-cream hover:bg-gold hover:text-ink transition-colors"
                title="Quick-edit affiliate URL"
            >
                <LinkIcon className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

// ============================================================
// MAIN ADMIN DASHBOARD
// ============================================================
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

    // Filters
    const [query, setQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [affiliateFilter, setAffiliateFilter] = useState("all"); // all | linked | not-set

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

    // Client-side sort + filter
    const visibleProducts = useMemo(() => {
        const q = query.trim().toLowerCase();
        const arr = products
            .filter((p) => {
                if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
                if (affiliateFilter === "linked" && !(p.affiliate_url || "").trim()) return false;
                if (affiliateFilter === "not-set" && (p.affiliate_url || "").trim()) return false;
                if (!q) return true;
                return (
                    p.title?.toLowerCase().includes(q) ||
                    p.slug?.toLowerCase().includes(q)
                );
            })
            .sort((a, b) => {
                const pa = a.priority_order ?? 999;
                const pb = b.priority_order ?? 999;
                if (pa !== pb) return pa - pb;
                if (a.category !== b.category) return a.category.localeCompare(b.category);
                return (a.order ?? 0) - (b.order ?? 0);
            });
        return arr;
    }, [products, query, categoryFilter, affiliateFilter]);

    const linkedCount = useMemo(
        () => products.filter((p) => (p.affiliate_url || "").trim()).length,
        [products]
    );

    const stats = [
        { label: "Products", value: products.length, icon: Package },
        { label: "Affiliate links", value: `${linkedCount}/${products.length}`, icon: Link2 },
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
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                    {stats.map((s) => (
                        <div
                            key={s.label}
                            className="bg-ink-100 border border-gold/15 rounded-2xl p-6"
                            data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                            <s.icon className="h-4 w-4 text-gold mb-3" />
                            <p className="font-serif text-3xl text-cream">{s.value}</p>
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
                        {/* Filter bar */}
                        <div className="flex flex-wrap items-center gap-3 mb-5">
                            <div className="relative flex-1 min-w-[220px]">
                                <Search className="h-4 w-4 text-cream/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search by title or slug…"
                                    data-testid="admin-products-search"
                                    className="w-full bg-ink-100 border border-gold/20 text-cream rounded-full pl-10 pr-4 py-2.5 text-sm font-light outline-none focus:border-gold"
                                />
                            </div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                data-testid="admin-products-category-filter"
                                className="bg-ink-100 border border-gold/20 text-cream rounded-full px-4 py-2.5 text-xs uppercase tracking-[0.2em]"
                            >
                                <option value="all">All categories</option>
                                {CATEGORIES.map((c) => (
                                    <option key={c.slug} value={c.slug}>
                                        {c.short}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={affiliateFilter}
                                onChange={(e) => setAffiliateFilter(e.target.value)}
                                data-testid="admin-products-affiliate-filter"
                                className="bg-ink-100 border border-gold/20 text-cream rounded-full px-4 py-2.5 text-xs uppercase tracking-[0.2em]"
                            >
                                <option value="all">All links</option>
                                <option value="linked">✓ Linked</option>
                                <option value="not-set">Not set</option>
                            </select>
                            <button
                                onClick={() => setCreating(true)}
                                data-testid="add-product"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold text-ink hover:bg-gold-light transition-colors ml-auto"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-[0.25em] font-medium">
                                    New product
                                </span>
                            </button>
                        </div>

                        {/* Result count */}
                        <p
                            data-testid="admin-products-count"
                            className="text-xs text-cream/45 uppercase tracking-[0.25em] mb-3"
                        >
                            Showing {visibleProducts.length} of {products.length}
                        </p>

                        {loading ? (
                            <p className="text-cream/60">Loading…</p>
                        ) : visibleProducts.length === 0 ? (
                            <div className="bg-ink-100 border border-gold/15 rounded-2xl p-10 text-center">
                                <p className="text-cream/60 mb-2">No products match these filters.</p>
                                <button
                                    onClick={() => {
                                        setQuery("");
                                        setCategoryFilter("all");
                                        setAffiliateFilter("all");
                                    }}
                                    className="text-gold text-xs uppercase tracking-[0.25em] hover:underline"
                                    data-testid="clear-filters"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <div className="bg-ink-100 border border-gold/15 rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="text-cream/55 uppercase tracking-[0.2em] text-xs border-b border-gold/15">
                                            <tr>
                                                <th className="p-4">Product</th>
                                                <th className="p-4">Category</th>
                                                <th className="p-4">Affiliate</th>
                                                <th className="p-4">Price</th>
                                                <th className="p-4">Flags</th>
                                                <th className="p-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {visibleProducts.map((p) => {
                                                const cat = CATEGORIES.find(
                                                    (c) => c.slug === p.category
                                                );
                                                const isPriorityPick =
                                                    typeof p.priority_order === "number" &&
                                                    p.priority_order < 999;
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
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <p className="font-serif text-lg text-cream truncate max-w-[260px]">
                                                                            {p.title}
                                                                        </p>
                                                                        {isPriorityPick && (
                                                                            <span
                                                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/20 text-gold text-[10px] uppercase tracking-[0.2em]"
                                                                                title={`Top Pick #${p.priority_order}`}
                                                                            >
                                                                                <Star className="h-3 w-3" />
                                                                                #{p.priority_order}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-cream/45 truncate max-w-[260px]">
                                                                        /{p.slug}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-cream/70 whitespace-nowrap">
                                                            {cat?.short}
                                                        </td>
                                                        <td className="p-4">
                                                            <QuickEditAffiliate
                                                                product={p}
                                                                onSaved={onSaved}
                                                            />
                                                        </td>
                                                        <td className="p-4 text-gold font-serif text-lg whitespace-nowrap">
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
                                                                <a
                                                                    href={`/product/${p.slug}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    data-testid={`view-public-${p.slug}`}
                                                                    className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-gold/30 text-cream hover:bg-gold hover:text-ink transition-colors"
                                                                    title="View public product page"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </a>
                                                                <button
                                                                    onClick={() => setEditing(p)}
                                                                    data-testid={`edit-${p.slug}`}
                                                                    className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-gold/30 text-cream hover:bg-gold hover:text-ink transition-colors"
                                                                    title="Edit full product"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => onDelete(p)}
                                                                    data-testid={`delete-${p.slug}`}
                                                                    className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-red-700/30 text-red-300 hover:bg-red-700 hover:text-cream transition-colors"
                                                                    title="Delete product"
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
                            <p className="text-cream/55">No leads captured yet.</p>
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
