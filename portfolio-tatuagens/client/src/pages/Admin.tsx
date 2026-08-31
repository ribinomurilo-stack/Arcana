import { useMemo, useState } from "react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { drawings, type DrawingStatus } from "@/data/drawings";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Check, Loader2, Search } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const statuses: DrawingStatus[] = ["Disponível", "Reservado", "Indisponível"];

export default function Admin() {
  const { user, loading } = useAuth();
  const [search, setSearch] = useState("");
  const overridesQuery = trpc.drawingStatuses.list.useQuery();
  const utils = trpc.useUtils();
  const updateStatus = trpc.drawingStatuses.update.useMutation({
    onSuccess: async () => {
      await utils.drawingStatuses.list.invalidate();
      toast.success("Status atualizado no catálogo.");
    },
    onError: (error) => toast.error(error.message || "Não foi possível atualizar o status."),
  });
  const overrides = useMemo(() => new Map((overridesQuery.data ?? []).map((item) => [item.drawingId, item.status])), [overridesQuery.data]);
  const filteredDrawings = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    if (!term) return drawings;
    return drawings.filter((drawing) => `${drawing.title} ${drawing.label} ${drawing.category} ${drawing.id}`.toLocaleLowerCase("pt-BR").includes(term));
  }, [search]);

  if (loading) return <main className="admin-page"><Loader2 className="admin-loader" aria-label="Carregando acesso" /></main>;
  if (!user) return <main className="admin-page"><div className="admin-gate"><p className="eyebrow"><span className="eyebrow-dot vermilion" /> ÁREA RESTRITA</p><h1>Entrar para<br /><em>gerenciar.</em></h1><p>Faça login para acessar os controles internos da Arcana.</p><button type="button" className="admin-primary-button" onClick={() => startLogin()}>Entrar com minha conta</button><Link href="/" className="admin-back-link"><ArrowLeft size={14} /> Voltar ao portfólio</Link></div></main>;
  if (user.role !== "admin") return <main className="admin-page"><div className="admin-gate"><p className="eyebrow"><span className="eyebrow-dot vermilion" /> ACESSO NEGADO</p><h1>Área para<br /><em>administradores.</em></h1><p>Sua conta está autenticada, mas não possui permissão para editar o catálogo.</p><Link href="/" className="admin-back-link"><ArrowLeft size={14} /> Voltar ao portfólio</Link></div></main>;

  return <main className="admin-page">
    <header className="admin-header"><div><p className="eyebrow"><span className="eyebrow-dot vermilion" /> ARCANA / CONTROLE</p><h1>Status do <em>acervo.</em></h1><p className="admin-intro">Altere rapidamente a disponibilidade exibida nos cards públicos. As mudanças ficam registradas para a conta administradora.</p></div><Link href="/" className="admin-back-link"><ArrowLeft size={14} /> Ver portfólio</Link></header>
    <section className="admin-toolbar" aria-label="Ferramentas administrativas"><label className="admin-search"><Search size={15} /><span className="sr-only">Buscar desenho</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, família ou ID" /></label><span>{filteredDrawings.length} desenhos</span></section>
    <section className="admin-grid" aria-label="Lista de desenhos">
      {filteredDrawings.map((drawing) => {
        const currentStatus = overrides.get(drawing.id) ?? drawing.status;
        return <article className="admin-card" key={drawing.id}><div className="admin-card-image"><img src={drawing.url} alt={`${drawing.label} — ${drawing.title}`} loading="lazy" /><span className={`availability-badge is-${currentStatus === "Disponível" ? "available" : currentStatus === "Reservado" ? "reserved" : "unavailable"}`}><i /> {currentStatus}</span></div><div className="admin-card-body"><div><strong>{drawing.title || drawing.label}</strong><span>{drawing.label} · {drawing.id.slice(0, 12)}</span></div><label className="admin-status-field"><span>Status</span><select value={currentStatus} disabled={updateStatus.isPending} onChange={(event) => updateStatus.mutate({ drawingId: drawing.id, status: event.target.value as DrawingStatus })}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>{updateStatus.isPending && updateStatus.variables?.drawingId === drawing.id ? <Loader2 size={14} className="admin-status-spinner" /> : <Check size={14} />}</label></div></article>;
      })}
    </section>
  </main>;
}
