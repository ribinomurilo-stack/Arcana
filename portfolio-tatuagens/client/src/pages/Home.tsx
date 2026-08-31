// Arcana — composição editorial: o desenho domina, a interface orienta.
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight, Copy, Fullscreen, Instagram, Loader2, Menu, MessageCircle, Minus, Minimize2, Moon, Music2, Plus, Search, Share2, Sun, Undo2, Upload, X, ZoomIn, ZoomOut } from "lucide-react";
import { categoryOrder, drawings, type Drawing } from "@/data/drawings";
import { trpc } from "@/lib/trpc";
import { getActiveFlashDrawings, getDrawingShareUrl, getFlashCountdown, getNextFlashRotationAt, getVisibleFlashDrawings, hasMoreFlashDrawings as canLoadMoreFlashDrawings, getWhatsAppShareUrl } from "@/lib/flashRotation";
import { getAvailabilityClass, getAvailabilityLabel } from "@/lib/availability";
import { getCatalogParallaxOffset } from "@/lib/catalogParallax";
import { matchesDrawingSearch } from "@/lib/drawingSearch";
import { ARCHIVE_SELECTION_SIZE, getActiveArchiveSelection, getArchiveSelectionCountdown, getNextArchiveSelectionAt } from "@/lib/archiveSelection";
import { getImageLoadingClass } from "@/lib/imageLoading";
import { getLightboxSwipeAction } from "@/lib/lightboxGestures";
import { buildQuoteWhatsAppMessage, buildWhatsAppUrl } from "@/lib/quoteWhatsApp";
import { getQuoteIdeaCounterText, validateQuoteFields, type QuoteFieldErrors } from "@/lib/quoteValidation";
import { EMPTY_QUOTE_DRAFT, hasQuoteDraft, QUOTE_DRAFT_STORAGE_KEY, readQuoteDraft, updateQuoteTextField, type QuoteDraft, type QuoteTextField } from "@/lib/quoteDraft";
import { formatBrazilianPhone } from "@/lib/phoneMask";
import { formatReferenceFileSize, formatReferenceFileType, reorderReferenceFiles } from "@/lib/referenceFiles";
import { useTheme } from "@/contexts/ThemeContext";

const logoUrl = "/manus-storage/arcana-mark_0849c5d8.png";
const heroUrl = "/manus-storage/atlas-hero-authorial-guardian_373f470e.jpg";
const stampUrl = "/manus-storage/atlas-editorial-creature-replacement_23227118.jpg";
const studioUrl = "/manus-storage/atlas-contact-authorial-studio_fb1d56c6.jpg";
const instagramUrl = "https://www.instagram.com/mukkatattoo/";
const whatsappUrl = "https://api.whatsapp.com/send/?phone=5511984564012&text&type=phone_number&app_absent=0&utm_source=ig";
const whatsappFloatingUrl = whatsappUrl;
const ambientAudioUrl = "/manus-storage/arcana-ambient_213117f4.wav";
const AMBIENT_AUDIO_STORAGE_KEY = "arcana-ambient-audio-enabled";
const quoteEmail = "contato@atlasdetinta.com";
const FLASH_ARCHIVE_PAGE_SIZE = 4;
const flashCategories = new Set(["MISTICOS", "OS PECULIARES", "KNIGHT ANIMALS"]);
const mainCategoryCount = categoryOrder.filter((category) => category !== "VIkings" && !flashCategories.has(category)).length;
const flashCollectionCount = flashCategories.size;
type CatalogSort = "catalog" | "recent";
type AvailabilityFilter = "all" | "Disponível" | "Reservado" | "Indisponível";
type BriefingChangeInput =
  | { kind: "field"; field: QuoteTextField; label: string; previousValue: string; nextValue: string }
  | { kind: "reference-note"; index: number; label: string; previousValue: string; nextValue: string };
type BriefingChange = BriefingChangeInput & { id: number };

const briefingFieldLabels: Record<QuoteTextField, string> = {
  name: "Cliente",
  email: "E-mail",
  phone: "Telefone",
  placement: "Local no corpo",
  size: "Tamanho",
  preferredDate: "Data sugerida",
  idea: "Ideia / briefing",
};

const categoryLabels: Record<string, string> = {
  Anões: "Anões",
  Aqua: "Aqua",
  Arca: "Arca Surreal",
  Deuses: "Deuses",
  Dionísio: "Dionísio",
  Duendes: "Duendes",
  Elfos: "Elfos",
  Ents: "Ents",
  Fadas: "Fadas",
  Fruitppl: "Frutíferos",
  GATOS: "Gatos",
  Gnome: "Gnomos",
  Humanos: "Humanos",
  MISTICOS: "Místicos",
  "OS PECULIARES": "Os Peculiares",
  "KNIGHT ANIMALS": "Knight Animals",
  Morvuns: "Morvuns",
  Nextron: "Nextron",
  Projetos: "Projetos",
  Starman: "Starman",
  Umbra: "Umbra",
  "Valars(Tolkien)": "Valars",
  VIkings: "Vikings",
  Witches: "Bruxas",
};

const categoryDescriptors: Record<string, string> = {
  Anões: "retrato / grafite",
  Aqua: "criatura / linha",
  Arca: "fantasia / estudo",
  Deuses: "mitologia / blackwork",
  Dionísio: "figura / vertical",
  Duendes: "personagem / tinta",
  Elfos: "elfo / retrato",
  Ents: "natureza / criatura",
  Fadas: "fada / botânica",
  Fruitppl: "fruta / personagem",
  GATOS: "animal / estranho",
  Gnome: "gnomo / narrativo",
  Humanos: "retrato / fantasia",
  MISTICOS: "símbolo / ritual",
  "OS PECULIARES": "personagem / estranho",
  "KNIGHT ANIMALS": "animal / armadura",
  Morvuns: "criatura / fragmento",
  Nextron: "futuro / totem",
  Projetos: "aplicação / escala",
  Starman: "cosmos / retrato",
  Umbra: "natureza / sombra",
  "Valars(Tolkien)": "titã / épico",
  VIkings: "totem / ancestral",
  Witches: "bruxas / gesto",
};

const editorialTitles: Record<string, string> = {
  Anões: "Rosto em carvão",
  Aqua: "Entre marés",
  Arca: "Arca Surreal",
  Deuses: "Deus de passagem",
  Dionísio: "O corpo vertical",
  Duendes: "Pequeno desvio",
  Elfos: "Perfil de floresta",
  Ents: "O pastor das árvores",
  Fadas: "Asas em silêncio",
  Fruitppl: "Fruto de companhia",
  GATOS: "Gato amuleto",
  Gnome: "Guardião de bolso",
  Humanos: "Rainha do deserto",
  MISTICOS: "Ritual suspenso",
  "OS PECULIARES": "Os que escapam",
  "KNIGHT ANIMALS": "Bestiário de guarda",
  Morvuns: "Estudo de criatura",
  Nextron: "Totem do amanhã",
  Projetos: "Desenho em corpo",
  Starman: "Cabeça estelar",
  Umbra: "A figura umbral",
  "Valars(Tolkien)": "Titã sem nome",
  VIkings: "Sinal ancestral",
  Witches: "Voo de bruxas",
};

const featuredCategories = ["Elfos", "Ents", "Fadas", "GATOS", "Anões", "Aqua", "Arca", "Deuses", "Dionísio", "Duendes", "Fruitppl", "Gnome", "Humanos", "Morvuns", "Nextron", "Starman", "Umbra", "Witches", "Projetos", "Valars(Tolkien)"];

function getEditorialTitle(drawing: Drawing) {
  return editorialTitles[drawing.category] ?? `${categoryLabels[drawing.category]} / estudo`;
}

function getTileClass(index: number) {
  return ["tile-tall", "tile-wide", "tile-square", "tile-tall", "tile-short", "tile-square"][index % 6];
}

function scrollToId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  window.history.replaceState(null, "", `#${id}`);
  const top = target.getBoundingClientRect().top + window.scrollY - 72;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

type LoadingImageProps = { src: string; alt: string; loading?: "lazy" | "eager"; onLoad?: () => void; className?: string; style?: React.CSSProperties; };
function LoadingImage({ src, alt, loading = "lazy", onLoad, className, style }: LoadingImageProps) {
  const [loaded, setLoaded] = useState(false);
  return <span className={getImageLoadingClass(loaded)} data-loading-state={loaded ? "loaded" : "loading"} aria-busy={!loaded}>
    <span className="image-skeleton" aria-hidden="true" />
    {!loaded && <span className="image-loading-spinner" aria-hidden="true" />}
    <img className={className} style={style} src={src} alt={alt} loading={loading} onLoad={() => { setLoaded(true); onLoad?.(); }} />
  </span>;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function dataUrlToFile(dataUrl: string, name: string, type: string, lastModified: number) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], name, { type, lastModified });
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all");
  const [catalogSort, setCatalogSort] = useState<CatalogSort>("catalog");
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null);
  const [lightboxScopeIds, setLightboxScopeIds] = useState<string[] | null>(null);
  const lightboxTouchStartX = useRef<number | null>(null);
  const lightboxTouchStartY = useRef<number | null>(null);
  const lightboxPinchStartDistance = useRef<number | null>(null);
  const lightboxPinchStartScale = useRef(1);
  const lightboxPanStart = useRef({ x: 0, y: 0 });
  const lightboxPanOrigin = useRef({ x: 0, y: 0 });
  const lastLightboxTapAt = useRef(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [catalogParallaxOffset, setCatalogParallaxOffset] = useState(0);
  const [quoteSent, setQuoteSent] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [quoteSavedFeedback, setQuoteSavedFeedback] = useState<"saved" | "undone" | null>(null);
  const quoteSavedFeedbackTimerRef = useRef<number | null>(null);
  const [briefingChangeHistory, setBriefingChangeHistory] = useState<BriefingChange[]>([]);
  const briefingChangeIdRef = useRef(0);
  const [recentlyChangedFields, setRecentlyChangedFields] = useState<Set<string>>(() => new Set());
  const recentChangeTimersRef = useRef<Record<string, number>>({});
  const [quoteFieldErrors, setQuoteFieldErrors] = useState<QuoteFieldErrors>({});
  const [quoteDraft, setQuoteDraft] = useState<QuoteDraft>(() => readQuoteDraft());
  const [quoteDrawing, setQuoteDrawing] = useState<Drawing | null>(null);
  const [lastBriefingUrl, setLastBriefingUrl] = useState<string | null>(null);
  const [whatsappProcessing, setWhatsappProcessing] = useState(false);
  const [quoteConfirmationOpen, setQuoteConfirmationOpen] = useState(false);
  const [quoteReviewOpen, setQuoteReviewOpen] = useState(false);
  const [pendingQuoteReview, setPendingQuoteReview] = useState<QuoteDraft | null>(null);
  const [submittedQuote, setSubmittedQuote] = useState<{ name: string; phone: string; placement: string; size: string; preferredDate: string; idea: string; drawing?: string; referenceCount: number } | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [copySummaryStatus, setCopySummaryStatus] = useState<"idle" | "copied">("idle");
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const footerSocialRef = useRef<HTMLDivElement>(null);
  const [footerSocialsVisible, setFooterSocialsVisible] = useState(false);
  const [lightboxImageLoading, setLightboxImageLoading] = useState(false);
  const [lightboxDragDirection, setLightboxDragDirection] = useState<"left" | "right" | "down" | null>(null);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);
  const [lightboxZoomScale, setLightboxZoomScale] = useState(1);
  const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 });
  const [lightboxImmersive, setLightboxImmersive] = useState(false);
  const [showGestureHint, setShowGestureHint] = useState(false);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [referenceNotes, setReferenceNotes] = useState<string[]>([]);
  const [referencesHydrated, setReferencesHydrated] = useState(() => !(quoteDraft.referenceDrafts?.length));
  const [referenceDragIndex, setReferenceDragIndex] = useState<number | null>(null);
  const [referenceRemovalIndex, setReferenceRemovalIndex] = useState<number | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [ambientAudioEnabled, setAmbientAudioEnabled] = useState(() => window.localStorage.getItem(AMBIENT_AUDIO_STORAGE_KEY) !== "off");
  const [ambientAudioPlaying, setAmbientAudioPlaying] = useState(false);
  const [ambientAudioNeedsGesture, setAmbientAudioNeedsGesture] = useState(false);
  const ambientAudioRef = useRef<HTMLAudioElement>(null);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [flashVisibleCount, setFlashVisibleCount] = useState(FLASH_ARCHIVE_PAGE_SIZE);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [spotlightTransitioning, setSpotlightTransitioning] = useState(false);
  const [archiveFamilyFilter, setArchiveFamilyFilter] = useState("all");
  const [archiveStyleFilter, setArchiveStyleFilter] = useState("all");
  const { theme, toggleTheme } = useTheme();
  const referencePreviews = useMemo(() => referenceFiles.map((file) => ({ file, url: URL.createObjectURL(file) })), [referenceFiles]);
  const briefingReady = useMemo(() => Object.keys(validateQuoteFields(quoteDraft)).length === 0, [quoteDraft]);
  const quoteMutation = trpc.quotes.create.useMutation();
  const showQuoteSavedFeedback = (feedback: "saved" | "undone" = "saved") => {
    setQuoteSavedFeedback(feedback);
    if (quoteSavedFeedbackTimerRef.current) window.clearTimeout(quoteSavedFeedbackTimerRef.current);
    quoteSavedFeedbackTimerRef.current = window.setTimeout(() => {
      setQuoteSavedFeedback(null);
      quoteSavedFeedbackTimerRef.current = null;
    }, 1800);
  };
  const markBriefingFieldChanged = (fieldKey: string) => {
    setRecentlyChangedFields((current) => new Set(current).add(fieldKey));
    const existingTimer = recentChangeTimersRef.current[fieldKey];
    if (existingTimer) window.clearTimeout(existingTimer);
    recentChangeTimersRef.current[fieldKey] = window.setTimeout(() => {
      setRecentlyChangedFields((current) => {
        const next = new Set(current);
        next.delete(fieldKey);
        return next;
      });
      delete recentChangeTimersRef.current[fieldKey];
    }, 2400);
  };
  const recordBriefingChange = (change: BriefingChangeInput) => {
    const recordedChange: BriefingChange = { ...change, id: ++briefingChangeIdRef.current };
    setBriefingChangeHistory((current) => [...current, recordedChange]);
  };
  const updateQuoteDraft = (field: QuoteTextField, value: string, previousValue = quoteDraft[field]) => {
    setQuoteDraft((current) => ({ ...current, [field]: value }));
    setQuoteFieldErrors((current) => ({ ...current, [field]: undefined }));
    setQuoteError("");
    const previous = String(previousValue ?? "");
    const next = String(value ?? "");
    if (previous !== next) recordBriefingChange({ kind: "field", field, label: briefingFieldLabels[field], previousValue: previous, nextValue: next });
    markBriefingFieldChanged(field);
    showQuoteSavedFeedback();
  };
  const updatePendingQuoteField = (field: QuoteTextField, value: string) => {
    const previousValue = pendingQuoteReview?.[field] ?? quoteDraft[field];
    setPendingQuoteReview((current) => current ? updateQuoteTextField(current, field, value) : current);
    updateQuoteDraft(field, value, previousValue);
  };
  const undoLastBriefingChange = () => {
    const lastBriefingChange = briefingChangeHistory[briefingChangeHistory.length - 1];
    if (!lastBriefingChange) return;
    if (lastBriefingChange.kind === "field") {
      const { field, previousValue } = lastBriefingChange;
      setQuoteDraft((current) => updateQuoteTextField(current, field, previousValue));
      setPendingQuoteReview((current) => current ? updateQuoteTextField(current, field, previousValue) : current);
      setQuoteFieldErrors((current) => ({ ...current, [field]: undefined }));
      markBriefingFieldChanged(field);
    } else {
      const { index, previousValue } = lastBriefingChange;
      setReferenceNotes((current) => current.map((value, currentIndex) => currentIndex === index ? previousValue : value));
      setQuoteSent(false);
      setQuoteError("");
      markBriefingFieldChanged(`reference-note-${index}`);
    }
    setBriefingChangeHistory((current) => current.slice(0, -1));
    showQuoteSavedFeedback("undone");
  };
  const statusOverridesQuery = trpc.drawingStatuses.list.useQuery();
  const statusOverrides = useMemo(() => new Map((statusOverridesQuery.data ?? []).map((item) => [item.drawingId, item.status])), [statusOverridesQuery.data]);
  const catalogDrawings = useMemo(() => drawings.map((drawing) => ({ ...drawing, status: statusOverrides.get(drawing.id) ?? drawing.status })), [statusOverrides]);
  const visibleDrawings = useMemo(() => catalogDrawings.filter((drawing) => drawing.category !== "VIkings" && !flashCategories.has(drawing.category)), [catalogDrawings]);
  const flashDrawings = useMemo(() => catalogDrawings.filter((drawing) => flashCategories.has(drawing.category)), [catalogDrawings]);
  const activeFlashDrawings = useMemo(() => getActiveFlashDrawings(flashDrawings, clockNow), [clockNow, flashDrawings]);
  const flashCountdown = useMemo(() => getFlashCountdown(clockNow), [clockNow]);
  const nextFlashRotationAt = useMemo(() => getNextFlashRotationAt(clockNow), [clockNow]);
  const filteredFlashDrawings = useMemo(() => flashDrawings.filter((drawing) => matchesDrawingSearch(drawing, searchTerm, { category: categoryLabels[drawing.category], descriptor: categoryDescriptors[drawing.category], title: getEditorialTitle(drawing) })), [flashDrawings, searchTerm]);
  const flashArchiveDrawings = useMemo(() => searchTerm.trim() ? filteredFlashDrawings : getVisibleFlashDrawings(flashDrawings, flashVisibleCount), [filteredFlashDrawings, flashDrawings, flashVisibleCount, searchTerm]);
  const hasMoreFlashDrawings = !searchTerm.trim() && canLoadMoreFlashDrawings(flashDrawings, flashVisibleCount);
  const hasFlashRotation = activeFlashDrawings.length < flashDrawings.length;

  useEffect(() => {
    return () => {
      if (quoteSavedFeedbackTimerRef.current) window.clearTimeout(quoteSavedFeedbackTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const element = footerSocialRef.current;
    if (!element || typeof IntersectionObserver === "undefined") { setFooterSocialsVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setFooterSocialsVisible(true); observer.disconnect(); }
    }, { threshold: 0.2 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!referencesHydrated) return;
    let cancelled = false;
    const persistDraft = async () => {
      if (!hasQuoteDraft(quoteDraft) && referenceFiles.length === 0) {
        window.localStorage.removeItem(QUOTE_DRAFT_STORAGE_KEY);
        return;
      }
      try {
        const referenceDrafts = await Promise.all(referenceFiles.map(async (file, index) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          dataUrl: await fileToDataUrl(file),
          note: referenceNotes[index] ?? "",
        })));
        if (!cancelled) window.localStorage.setItem(QUOTE_DRAFT_STORAGE_KEY, JSON.stringify({ ...quoteDraft, referenceDrafts }));
      } catch {
        if (!cancelled && hasQuoteDraft(quoteDraft)) window.localStorage.setItem(QUOTE_DRAFT_STORAGE_KEY, JSON.stringify({ ...quoteDraft, referenceDrafts: [] }));
      }
    };
    void persistDraft();
    return () => { cancelled = true; };
  }, [quoteDraft, referenceFiles, referenceNotes, referencesHydrated]);

  useEffect(() => {
    const savedReferences = quoteDraft.referenceDrafts ?? [];
    if (!savedReferences.length) { setReferencesHydrated(true); return; }
    let cancelled = false;
    Promise.all(savedReferences.map((reference) => dataUrlToFile(reference.dataUrl, reference.name, reference.type || "image/jpeg", reference.lastModified || Date.now())))
      .then((restoredFiles) => {
        if (cancelled) return;
        setReferenceFiles(restoredFiles);
        setReferenceNotes(savedReferences.map((reference) => reference.note ?? ""));
        setReferencesHydrated(true);
      })
      .catch(() => { if (!cancelled) setReferencesHydrated(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let frame = 0;
    let lastSecond = Math.floor(Date.now() / 1000);
    const updateClock = () => {
      const nextSecond = Math.floor(Date.now() / 1000);
      if (nextSecond !== lastSecond) {
        lastSecond = nextSecond;
        setClockNow(Date.now());
      }
      frame = window.requestAnimationFrame(updateClock);
    };
    frame = window.requestAnimationFrame(updateClock);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    let frame = 0;
    const updateParallax = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const media = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
        const section = document.getElementById("arquivo");
        if (!media.matches || !section) { setCatalogParallaxOffset(0); return; }
        const rect = section.getBoundingClientRect();
        setCatalogParallaxOffset(getCatalogParallaxOffset(rect.top, rect.height, window.innerHeight));
      });
    };
    updateParallax();
    window.addEventListener("scroll", updateParallax, { passive: true });
    window.addEventListener("resize", updateParallax);
    return () => {
      window.removeEventListener("scroll", updateParallax);
      window.removeEventListener("resize", updateParallax);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    return () => referencePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [referencePreviews]);

  useEffect(() => {
    setCopyStatus("idle");
    if (selectedDrawing) setLightboxImageLoading(true);
  }, [selectedDrawing]);


  useEffect(() => {
    if (!quoteConfirmationOpen && !quoteReviewOpen && !clearConfirmOpen && referenceRemovalIndex === null) return;
    const handleModalKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (referenceRemovalIndex !== null) { closeReferenceRemovalConfirm(); return; }
      if (quoteConfirmationOpen) closeQuoteConfirmation();
      else if (quoteReviewOpen) closeQuoteReview();
      else if (clearConfirmOpen) setClearConfirmOpen(false);
    };
    document.addEventListener("keydown", handleModalKey);
    return () => document.removeEventListener("keydown", handleModalKey);
  }, [quoteConfirmationOpen, quoteReviewOpen, clearConfirmOpen, referenceRemovalIndex]);

  useEffect(() => {
    if (!quoteConfirmationOpen && !quoteReviewOpen && !clearConfirmOpen && referenceRemovalIndex === null && !selectedDrawing) return;
    const dialogs = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]'));
    const dialog = dialogs[dialogs.length - 1];
    if (!dialog) return;
    const getFocusable = () => Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled])'));
    const focusable = getFocusable();
    focusable[0]?.focus();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = getFocusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    dialog.addEventListener("keydown", trapFocus);
    return () => dialog.removeEventListener("keydown", trapFocus);
  }, [quoteConfirmationOpen, quoteReviewOpen, clearConfirmOpen, referenceRemovalIndex, selectedDrawing]);

  useEffect(() => {
    const audio = ambientAudioRef.current;
    if (!audio || !ambientAudioEnabled) return;
    let cancelled = false;
    audio.loop = true;
    audio.volume = 0.18;
    const tryPlay = () => {
      audio.play().then(() => {
        if (!cancelled) { setAmbientAudioPlaying(true); setAmbientAudioNeedsGesture(false); }
      }).catch(() => { if (!cancelled) setAmbientAudioNeedsGesture(true); });
    };
    const resumeAfterInteraction = () => tryPlay();
    tryPlay();
    window.addEventListener("pointerdown", resumeAfterInteraction, { once: true, passive: true });
    window.addEventListener("keydown", resumeAfterInteraction, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("pointerdown", resumeAfterInteraction);
      window.removeEventListener("keydown", resumeAfterInteraction);
    };
  }, [ambientAudioEnabled]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const isUndoShortcut = quoteReviewOpen && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z" && !event.shiftKey && briefingChangeHistory.length > 0;
      if (isUndoShortcut) {
        event.preventDefault();
        undoLastBriefingChange();
        return;
      }
      if (!selectedDrawing && (event.target as HTMLElement)?.matches?.("input, textarea, select, button")) return;
      if (selectedDrawing && event.key === "Escape") closeLightbox();
      if (selectedDrawing && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        moveLightbox(event.key === "ArrowLeft" ? -1 : 1);
      }
      if (!selectedDrawing && event.key === "ArrowLeft") moveSpotlight(-1);
      if (!selectedDrawing && event.key === "ArrowRight") moveSpotlight(1);
    };
    document.addEventListener("keydown", handleKey);
    if (selectedDrawing || quoteReviewOpen || quoteConfirmationOpen || clearConfirmOpen || referenceRemovalIndex !== null) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [selectedDrawing, quoteReviewOpen, quoteConfirmationOpen, clearConfirmOpen, referenceRemovalIndex, briefingChangeHistory]);

  const filteredDrawings = useMemo(() => {
    return visibleDrawings
      .filter((drawing) => {
        const matchesCategory = activeCategory === "all" || drawing.category === activeCategory;
        const matchesAvailability = availabilityFilter === "all" || drawing.status === availabilityFilter;
        return matchesCategory && matchesAvailability && matchesDrawingSearch(drawing, searchTerm, { category: categoryLabels[drawing.category], descriptor: categoryDescriptors[drawing.category], title: getEditorialTitle(drawing) });
      })
      .sort((a, b) => catalogSort === "recent" ? b.addedAt - a.addedAt : 0);
  }, [activeCategory, availabilityFilter, catalogSort, searchTerm, visibleDrawings]);

  const archiveSelectionCandidates = useMemo(
    () => featuredCategories.map((category) => catalogDrawings.find((drawing) => drawing.category === category)).filter(Boolean) as Drawing[],
    [catalogDrawings],
  );
  const featuredDrawings = useMemo(() => {
    const rotated = getActiveArchiveSelection(archiveSelectionCandidates, clockNow);
    const pinned = archiveSelectionCandidates.filter((drawing) => drawing.category === "Witches" || drawing.category === "Umbra");
    const withoutPinned = rotated.filter((drawing) => !pinned.some((item) => item.id === drawing.id));
    return [...withoutPinned, ...pinned].slice(0, ARCHIVE_SELECTION_SIZE);
  }, [archiveSelectionCandidates, clockNow]);
  const archiveStyleOptions = useMemo(() => Array.from(new Set(featuredDrawings.map((drawing) => categoryDescriptors[drawing.category]?.split(" / ")[1] ?? "estudo"))).sort(), [featuredDrawings]);
  const archiveFilteredDrawings = useMemo(() => featuredDrawings.filter((drawing) => (archiveFamilyFilter === "all" || drawing.category === archiveFamilyFilter) && (archiveStyleFilter === "all" || (categoryDescriptors[drawing.category]?.split(" / ")[1] ?? "estudo") === archiveStyleFilter)), [archiveFamilyFilter, archiveStyleFilter, featuredDrawings]);
  const archiveSelectionCountdown = useMemo(() => getArchiveSelectionCountdown(clockNow), [clockNow]);
  const nextArchiveSelectionAt = useMemo(() => getNextArchiveSelectionAt(clockNow), [clockNow]);

  const spotlightPool = filteredDrawings.length > 0 ? filteredDrawings : visibleDrawings;
  const spotlightPosition = spotlightPool.length > 0 ? spotlightIndex % spotlightPool.length : 0;
  const spotlightDrawing = spotlightPool[spotlightPosition] ?? catalogDrawings[0];
  const catalogSeries = useMemo(() => {
    const groups = new Map<string, Drawing[]>();
    filteredDrawings.forEach((drawing) => groups.set(drawing.category, [...(groups.get(drawing.category) ?? []), drawing]));
    return Array.from(groups.entries()).map(([category, series]) => ({ category, representative: series[0], drawings: series }));
  }, [filteredDrawings]);
  const lightboxDrawings = useMemo(() => {
    const unique = new Map<string, Drawing>();
    const scoped = lightboxScopeIds ? catalogDrawings.filter((drawing) => lightboxScopeIds.includes(drawing.id)) : [...filteredDrawings, ...flashDrawings, ...featuredDrawings];
    scoped.forEach((drawing) => unique.set(drawing.id, drawing));
    return Array.from(unique.values());
  }, [catalogDrawings, featuredDrawings, filteredDrawings, flashDrawings, lightboxScopeIds]);

  const showFirstGestureHint = () => {
    if (window.localStorage.getItem("atlas-lightbox-gestures-seen") !== "1") {
      setShowGestureHint(true);
      window.localStorage.setItem("atlas-lightbox-gestures-seen", "1");
    }
  };
  const openDrawing = (drawing: Drawing) => {
    setLightboxScopeIds(null);
    setLightboxZoomScale(1);
    setLightboxPan({ x: 0, y: 0 });
    setLightboxZoomed(false);
    setLightboxImmersive(false);
    showFirstGestureHint();
    setSelectedDrawing(drawing);
  };
  const openDrawingSeries = (drawing: Drawing, series: Drawing[]) => {
    setLightboxScopeIds(series.map((item) => item.id));
    setLightboxZoomScale(1);
    setLightboxPan({ x: 0, y: 0 });
    setLightboxZoomed(false);
    setLightboxImmersive(false);
    showFirstGestureHint();
    setSelectedDrawing(drawing);
  };

  const toggleLightboxZoom = () => {
    setLightboxZoomed((current) => {
      const next = !current;
      setLightboxZoomScale(next ? 2 : 1);
      setLightboxPan({ x: 0, y: 0 });
      return next;
    });
  };
  const toggleImmersiveView = () => {
    setLightboxImmersive((current) => {
      const next = !current;
      if (next) {
        setShowGestureHint(false);
        setShareMenuOpen(false);
      }
      return next;
    });
  };
  const closeLightbox = () => {
    setSelectedDrawing(null);
    setLightboxScopeIds(null);
    setLightboxDragDirection(null);
    setLightboxZoomed(false);
    setLightboxZoomScale(1);
    setLightboxPan({ x: 0, y: 0 });
    setLightboxImmersive(false);
    setShowGestureHint(false);
  };

    const handleLightboxTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touches = event.touches;
    if (touches.length >= 2) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      lightboxPinchStartDistance.current = Math.hypot(dx, dy);
      lightboxPinchStartScale.current = lightboxZoomScale;
      return;
    }
    const touch = event.changedTouches[0];
    lightboxTouchStartX.current = touch?.clientX ?? null;
    lightboxTouchStartY.current = touch?.clientY ?? null;
    lightboxPanStart.current = { x: touch?.clientX ?? 0, y: touch?.clientY ?? 0 };
    lightboxPanOrigin.current = lightboxPan;
    setLightboxDragDirection(null);
  };
  const handleLightboxTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const touches = event.touches;
    if (touches.length >= 2) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      const distance = Math.hypot(dx, dy);
      const startDistance = lightboxPinchStartDistance.current;
      if (startDistance) {
        event.preventDefault();
        const nextScale = Math.min(3, Math.max(1, lightboxPinchStartScale.current * (distance / startDistance)));
        setLightboxZoomScale(nextScale);
        setLightboxZoomed(nextScale > 1.02);
      }
      return;
    }
    const touch = touches[0];
    const startX = lightboxTouchStartX.current;
    const startY = lightboxTouchStartY.current;
    if (startX === null || startY === null || !touch) return;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    if (lightboxZoomScale > 1.02) {
      event.preventDefault();
      setLightboxPan({ x: lightboxPanOrigin.current.x + (touch.clientX - lightboxPanStart.current.x), y: lightboxPanOrigin.current.y + (touch.clientY - lightboxPanStart.current.y) });
      return;
    }
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return;
    setLightboxDragDirection(Math.abs(dy) > Math.abs(dx) && dy > 0 ? "down" : dx < 0 ? "left" : "right");
  };
  const handleLightboxTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = lightboxTouchStartX.current;
    const startY = lightboxTouchStartY.current;
    const touch = event.changedTouches[0];
    const endX = touch?.clientX;
    const endY = touch?.clientY;
    lightboxTouchStartX.current = null;
    lightboxTouchStartY.current = null;
    lightboxPinchStartDistance.current = null;
    if (startX === null || startY === null || endX === undefined || endY === undefined) return;
    const dx = endX - startX;
    const dy = endY - startY;
    const swipeAction = getLightboxSwipeAction(dx, dy, lightboxZoomScale);
    if (swipeAction === "close") closeLightbox();
    else if (swipeAction === "next") moveLightbox(1);
    else if (swipeAction === "previous") moveLightbox(-1);
    window.setTimeout(() => setLightboxDragDirection(null), 180);
  };
  const handleLightboxDoubleTap = () => {
    const now = Date.now();
    if (now - lastLightboxTapAt.current < 320) {
      setLightboxZoomed((zoomed) => {
        const nextZoomed = !zoomed;
        setLightboxZoomScale(nextZoomed ? 2 : 1);
        setLightboxPan({ x: 0, y: 0 });
        return nextZoomed;
      });
    }
    lastLightboxTapAt.current = now;
  };

  const moveLightbox = (direction: number) => {
    if (!selectedDrawing || lightboxDrawings.length < 2) return;
    const currentIndex = lightboxDrawings.findIndex((drawing) => drawing.id === selectedDrawing.id);
    const safeIndex = currentIndex < 0 ? 0 : currentIndex;
    const nextIndex = (safeIndex + direction + lightboxDrawings.length) % lightboxDrawings.length;
    setLightboxZoomed(false);
    setLightboxDragDirection(null);
    setSelectedDrawing(lightboxDrawings[nextIndex]);
  };

  const moveSpotlight = (direction: number) => {
    if (spotlightPool.length < 2) return;
    setSpotlightTransitioning(true);
    setSpotlightIndex((current) => (current + direction + spotlightPool.length) % spotlightPool.length);
    window.setTimeout(() => setSpotlightTransitioning(false), 220);
  };

  const selectSpotlight = (index: number) => {
    setSpotlightTransitioning(true);
    setSpotlightIndex(index);
    window.setTimeout(() => setSpotlightTransitioning(false), 220);
  };

  const changeCategory = (category: string) => {
    setActiveCategory(category);
    setSpotlightIndex(0);
  };

  const clearCatalogFilters = () => {
    setActiveCategory("all");
    setSearchTerm("");
    setAvailabilityFilter("all");
    setCatalogSort("catalog");
    setSpotlightIndex(0);
  };


  const handleReferenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/")).slice(0, 5);
    setReferenceFiles(files);
    setReferenceNotes(files.map(() => ""));
    setQuoteSent(false);
    setQuoteError("");
  };

  const removeReference = (index: number) => {
    setReferenceFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setReferenceNotes((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setQuoteSent(false);
    setQuoteError("");
  };

  const updateReferenceNote = (index: number, note: string) => {
    const previousValue = referenceNotes[index] ?? "";
    if (previousValue !== note) recordBriefingChange({ kind: "reference-note", index, label: `Nota · referência ${index + 1}`, previousValue, nextValue: note });
    setReferenceNotes((current) => current.map((value, currentIndex) => currentIndex === index ? note : value));
    setQuoteSent(false);
    setQuoteError("");
    markBriefingFieldChanged(`reference-note-${index}`);
    showQuoteSavedFeedback();
  };

  const requestReferenceRemoval = (index: number) => setReferenceRemovalIndex(index);

  const closeReferenceRemovalConfirm = () => {
    const index = referenceRemovalIndex;
    setReferenceRemovalIndex(null);
    if (index === null) return;
    window.setTimeout(() => document.querySelector<HTMLElement>(`[data-reference-index="${index}"]`)?.focus(), 0);
  };

  const confirmReferenceRemoval = () => {
    if (referenceRemovalIndex === null) return;
    removeReference(referenceRemovalIndex);
    setReferenceRemovalIndex(null);
    window.setTimeout(() => document.querySelector<HTMLElement>(`[data-reference-index="${Math.max(0, referenceRemovalIndex - 1)}"]`)?.focus(), 0);
  };

  const handleReferenceDragStart = (event: React.DragEvent<HTMLElement>, index: number) => {
    setReferenceDragIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  };

  const handleReferenceDragOver = (event: React.DragEvent<HTMLElement>) => event.preventDefault();

  const handleReferenceDrop = (event: React.DragEvent<HTMLElement>, toIndex: number) => {
    event.preventDefault();
    const fromIndex = referenceDragIndex ?? Number(event.dataTransfer.getData("text/plain"));
    if (Number.isInteger(fromIndex)) {
      setReferenceFiles((current) => reorderReferenceFiles(current, fromIndex, toIndex));
      setReferenceNotes((current) => reorderReferenceFiles(current, fromIndex, toIndex));
    }
    setReferenceDragIndex(null);
  };

  const handleReferenceDragEnd = () => setReferenceDragIndex(null);

  const moveReference = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    setReferenceFiles((current) => reorderReferenceFiles(current, index, targetIndex));
    setReferenceNotes((current) => reorderReferenceFiles(current, index, targetIndex));
    window.setTimeout(() => document.querySelector<HTMLElement>(`[data-reference-index="${targetIndex}"]`)?.focus(), 0);
  };

  const handleQuoteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values: QuoteDraft = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      placement: String(formData.get("placement") ?? ""),
      size: String(formData.get("size") ?? ""),
      preferredDate: String(formData.get("preferredDate") ?? ""),
      idea: String(formData.get("idea") ?? ""),
    };
    const fieldErrors = validateQuoteFields(values);
    setQuoteFieldErrors(fieldErrors);
    setQuoteSent(false);
    setQuoteError("");
    setQuoteConfirmationOpen(false);
    setLastBriefingUrl(null);
    if (Object.keys(fieldErrors).length > 0) {
      setQuoteError("Revise os campos destacados antes de continuar.");
      return;
    }
    setPendingQuoteReview(values);
    setQuoteReviewOpen(true);
  };

  const submitReviewedQuote = async () => {
    if (!pendingQuoteReview) return;
    const values = pendingQuoteReview;
    const fieldErrors = validateQuoteFields(values);
    setQuoteFieldErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      setQuoteError("Revise os campos destacados antes de continuar.");
      return;
    }
    setQuoteError("");
    setWhatsappProcessing(true);
    try {
      const references = await Promise.all(referenceFiles.map(async (file, index) => ({ name: file.name, type: file.type, data: await fileToDataUrl(file), note: referenceNotes[index]?.trim() || undefined })));
      const quoteData = {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        placement: values.placement.trim(),
        size: values.size.trim(),
        idea: values.idea.trim(),
        preferredDate: values.preferredDate,
        references,
      };
      await quoteMutation.mutateAsync(quoteData);
      const briefingMessage = buildQuoteWhatsAppMessage({ ...quoteData, referenceNames: referenceFiles.map((file) => file.name), referenceNotes, selectedDrawingTitle: quoteDrawing ? `${getEditorialTitle(quoteDrawing)} — ${categoryLabels[quoteDrawing.category]}` : undefined });
      const whatsappBriefingUrl = buildWhatsAppUrl("5511984564012", briefingMessage);
      setLastBriefingUrl(whatsappBriefingUrl);
      setSubmittedQuote({ name: quoteData.name, phone: quoteData.phone, placement: quoteData.placement, size: quoteData.size, preferredDate: quoteData.preferredDate, idea: quoteData.idea, drawing: quoteDrawing ? getEditorialTitle(quoteDrawing) : undefined, referenceCount: referenceFiles.length });
      window.open(whatsappBriefingUrl, "_blank", "noopener,noreferrer");
      setQuoteSent(true);
      setWhatsappProcessing(false);
      setQuoteConfirmationOpen(true);
      setQuoteReviewOpen(false);
      setPendingQuoteReview(null);
      setReferenceFiles([]);
      setQuoteDraft(EMPTY_QUOTE_DRAFT);
      setQuoteFieldErrors({});
      setBriefingChangeHistory([]);
      setRecentlyChangedFields(new Set());
      setQuoteSavedFeedback(null);
      const form = document.querySelector<HTMLFormElement>(".quote-form");
      form?.reset();
    } catch {
      setWhatsappProcessing(false);
      setQuoteError("Não foi possível enviar agora. Tente novamente ou escreva diretamente para o estúdio.");
    }
  };

  const resetQuoteForm = () => {
    setQuoteDraft(EMPTY_QUOTE_DRAFT);
    setQuoteFieldErrors({});
    setQuoteError("");
    setQuoteSavedFeedback(null);
    setBriefingChangeHistory([]);
    setRecentlyChangedFields(new Set());
    setQuoteSent(false);
    setReferenceFiles([]);
    setReferenceNotes([]);
    setReferencesHydrated(true);
    setReferenceDragIndex(null);
    setReferenceRemovalIndex(null);
    setLastBriefingUrl(null);
    setSubmittedQuote(null);
    setPendingQuoteReview(null);
    setQuoteReviewOpen(false);
  };

  const clearQuoteForm = () => {
    if (hasQuoteDraft(quoteDraft) || referenceFiles.length > 0 || quoteSent) {
      setClearConfirmOpen(true);
      return;
    }
    resetQuoteForm();
  };

  const closeQuoteReview = () => {
    setQuoteReviewOpen(false);
    window.setTimeout(() => submitButtonRef.current?.focus(), 0);
  };

  const closeQuoteConfirmation = () => {
    setQuoteConfirmationOpen(false);
    window.setTimeout(() => submitButtonRef.current?.focus(), 0);
  };

  const copySubmittedSummary = async () => {
    if (!submittedQuote) return;
    const summary = [
      `Cliente: ${submittedQuote.name}`,
      `Telefone: ${submittedQuote.phone}`,
      `Local / tamanho: ${submittedQuote.placement} · ${submittedQuote.size}`,
      `Data sugerida: ${submittedQuote.preferredDate}`,
      submittedQuote.drawing ? `Desenho: ${submittedQuote.drawing}` : "",
      `Ideia: ${submittedQuote.idea}`,
      `Referências: ${submittedQuote.referenceCount}`,
    ].filter(Boolean).join("\n");
    try {
      await navigator.clipboard.writeText(summary);
      setCopySummaryStatus("copied");
      window.setTimeout(() => setCopySummaryStatus("idle"), 2200);
    } catch {
      setCopySummaryStatus("idle");
    }
  };

  const resendBriefingToWhatsApp = () => {
    if (!lastBriefingUrl) return;
    window.open(lastBriefingUrl, "_blank", "noopener,noreferrer");
  };

  const chooseDrawingForQuote = (drawing: Drawing) => {
    setQuoteDrawing(drawing);
    closeLightbox();
    window.setTimeout(() => scrollToId("contato"), 40);
  };

  const shareToWhatsApp = () => {
    if (!selectedDrawing) return;
    const imageUrl = getDrawingShareUrl(selectedDrawing.url, window.location.origin);
    const message = `Olha este desenho da Arcana: ${getEditorialTitle(selectedDrawing)} — ${categoryLabels[selectedDrawing.category]}. ${imageUrl}`;
    window.open(getWhatsAppShareUrl(message), "_blank", "noopener,noreferrer");
  };

  const shareDrawingToSocial = async (network: "whatsapp" | "facebook" | "tiktok" | "instagram") => {
    if (!selectedDrawing) return;
    const imageUrl = getDrawingShareUrl(selectedDrawing.url, window.location.origin);
    const title = getEditorialTitle(selectedDrawing);
    const message = `Olha este desenho da Arcana: ${title} — ${categoryLabels[selectedDrawing.category]}. ${imageUrl}`;
    if (network === "whatsapp") window.open(getWhatsAppShareUrl(message), "_blank", "noopener,noreferrer");
    if (network === "facebook") window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}&quote=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    if (network === "tiktok" || network === "instagram") {
      try { await navigator.clipboard.writeText(message); setCopyStatus("copied"); window.setTimeout(() => setCopyStatus("idle"), 2200); } catch { setCopyStatus("idle"); }
      window.open(network === "tiktok" ? "https://www.tiktok.com/" : instagramUrl, "_blank", "noopener,noreferrer");
    }
    setShareMenuOpen(false);
  };

  const copyDrawingLink = async () => {
    if (!selectedDrawing) return;
    const link = getDrawingShareUrl(selectedDrawing.url, window.location.origin);
    try {
      await navigator.clipboard.writeText(link);
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 2200);
    } catch {
      setCopyStatus("idle");
    }
  };

  const toggleAmbientAudio = () => {
    const audio = ambientAudioRef.current;
    if (!audio) return;
    if (ambientAudioPlaying) {
      audio.pause();
      setAmbientAudioPlaying(false);
      setAmbientAudioEnabled(false);
      window.localStorage.setItem(AMBIENT_AUDIO_STORAGE_KEY, "off");
      return;
    }
    setAmbientAudioEnabled(true);
    window.localStorage.setItem(AMBIENT_AUDIO_STORAGE_KEY, "on");
    audio.play().then(() => { setAmbientAudioPlaying(true); setAmbientAudioNeedsGesture(false); }).catch(() => setAmbientAudioNeedsGesture(true));
  };

  return (
    <div className="atlas-site">
      <audio ref={ambientAudioRef} className="ambient-audio-element" src={ambientAudioUrl} loop autoPlay preload="auto" aria-hidden="true" />
      <aside className={`atlas-rail ${scrolled ? "is-scrolled" : ""}`} aria-label="Navegação lateral">
        <a className="rail-brand" href="#top" aria-label="Arcana — voltar ao topo">
          <img src={logoUrl} alt="" />
          <span>ARCANA</span>
        </a>
        <div className="rail-rule" />
        <span className="rail-index">ARQ. 01—{String(mainCategoryCount + flashCollectionCount).padStart(2, "0")}</span>
        <nav className="rail-links">
          <a href="#obra">01 <span>Obra</span></a>
          <a href="#flashs">02 <span>Flashs</span></a>
          <a href="#manifesto">03 <span>Manifesto</span></a>
          <a href="#contato">04 <span>Contato</span></a>
          <a href="#faq">05 <span>Antes do traço</span></a>
        </nav>
        <span className="rail-year">© 2026</span>
      </aside>

      <div className="atlas-main" id="top">
        <header className={`topbar ${scrolled ? "topbar-solid" : ""}`}>
          <a className="mobile-brand" href="#top">
            <img src={logoUrl} alt="" />
            <span>ARCANA</span>
          </a>
          <p className="topbar-note">ARQUIVO DE DESENHOS AUTORAIS <span>●</span> SÃO PAULO / BR</p>
          <nav className="topbar-nav" aria-label="Navegação principal">
            <a href="#obra">Obra</a>
            <a href="#flashs">Flashs</a>
            <a href="#manifesto">Sobre</a>
            <button className="theme-toggle" type="button" onClick={() => toggleTheme?.()} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"} aria-pressed={theme === "dark"}>{theme === "dark" ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}<span>{theme === "dark" ? "Claro" : "Escuro"}</span></button>
            <button className={`ambient-audio-toggle${ambientAudioPlaying ? " is-playing" : ""}`} type="button" onClick={toggleAmbientAudio} aria-pressed={ambientAudioPlaying} aria-label={ambientAudioPlaying ? "Pausar trilha ambiente Arcana" : "Ativar trilha ambiente Arcana"} title={ambientAudioPlaying ? "Pausar trilha ambiente" : ambientAudioNeedsGesture ? "Clique para ouvir a trilha ambiente" : "Ativar trilha ambiente"}><Music2 size={14} strokeWidth={1.5} /><span>{ambientAudioPlaying ? "Som" : ambientAudioNeedsGesture ? "Ouvir" : "Som"}</span></button>
            <div className="social-actions" aria-label="Redes sociais">
              <a href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram @mukkatattoo"><Instagram size={14} strokeWidth={1.5} /></a>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Abrir WhatsApp"><MessageCircle size={14} strokeWidth={1.5} /></a>
            </div>
            <a href="#contato" className="topbar-cta">Agendar <ArrowUpRight size={15} strokeWidth={1.5} /></a>
          </nav>
          <div className="mobile-social-actions" aria-label="Redes sociais e tema">
            <button className="theme-toggle theme-toggle-mobile" type="button" onClick={() => toggleTheme?.()} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"} aria-pressed={theme === "dark"}>{theme === "dark" ? <Sun size={15} strokeWidth={1.5} /> : <Moon size={15} strokeWidth={1.5} />}</button>
            <button className={`ambient-audio-toggle ambient-audio-toggle-mobile${ambientAudioPlaying ? " is-playing" : ""}`} type="button" onClick={toggleAmbientAudio} aria-pressed={ambientAudioPlaying} aria-label={ambientAudioPlaying ? "Pausar trilha ambiente Arcana" : "Ativar trilha ambiente Arcana"} title={ambientAudioPlaying ? "Pausar trilha ambiente" : "Ativar trilha ambiente"}><Music2 size={15} strokeWidth={1.5} /></button>
            <a href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram @mukkatattoo"><Instagram size={15} strokeWidth={1.5} /></a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Abrir WhatsApp"><MessageCircle size={15} strokeWidth={1.5} /></a>
          </div>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        {menuOpen && (
          <div className="mobile-menu">
            <a href="#obra" onClick={() => setMenuOpen(false)}>Obra <ArrowDownRight size={18} /></a>
            <a href="#flashs" onClick={() => setMenuOpen(false)}>Flashs <ArrowDownRight size={18} /></a>
            <a href="#manifesto" onClick={() => setMenuOpen(false)}>Manifesto <ArrowDownRight size={18} /></a>
            <a href="#contato" onClick={() => setMenuOpen(false)}>Contato <ArrowDownRight size={18} /></a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>Antes do primeiro traço <ArrowDownRight size={18} /></a>
          </div>
        )}

        <main>
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-image" style={{ backgroundImage: `url(${heroUrl})` }} />
            <div className="hero-overlay" />
            <div className="hero-gridline hero-gridline-left" />
            <div className="hero-gridline hero-gridline-right" />
            <div className="hero-content">
              <p className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> ESTÚDIO DE DESENHO & TATUAGEM <span className="eyebrow-number">01 / 04</span></p>
              <div className="hero-seal"><img src={logoUrl} alt="" /><span>ARCANA<br />2026</span></div>
              <h1 id="hero-title">Desenhos para<br /><em>carregar</em> uma<br />história na pele.</h1>
              <div className="hero-bottom">
                <p>Um arquivo de criaturas, símbolos e personagens para quem procura uma peça com narrativa — e não apenas um desenho pronto.</p>
                <button className="round-link" onClick={() => scrollToId("obra")} aria-label="Explorar a obra"><ArrowDownRight size={22} strokeWidth={1.25} /></button>
              </div>
            </div>
            <div className="hero-caption">ARQUIVO VIVO / TRAÇO EM MOVIMENTO</div>
          </section>

          <section className="intro-section paper-section" id="obra">
            <div className="section-marker"><span>01</span><i /></div>
            <div className="intro-copy">
              <p className="eyebrow"><span className="eyebrow-dot vermilion" /> CADERNO DE OBRAS <span className="eyebrow-number">{visibleDrawings.length} DESENHOS</span></p>
              <h2>A obra<br /><em>é o começo.</em></h2>
              <p className="intro-text">Cada desenho nasce como uma conversa entre referências, matéria e imaginação. Aqui, eles aparecem como um arquivo aberto: escolha uma direção, aproxime-se do traço e leve a sua história para a pele.</p>
            </div>
            <div className="intro-aside">
              <span className="vertical-word">CATÁLOGO</span>
              <div className="intro-aside-copy"><span>{mainCategoryCount}</span><p>famílias<br />visuais<br /><small>+ {flashCollectionCount} coleções Flash</small></p></div>
            </div>
          </section>

          <section className="featured-strip paper-section">
            <div className="featured-head">
              <p className="eyebrow">SELEÇÃO DO ARQUIVO <span className="eyebrow-number">{featuredDrawings.length} / {archiveSelectionCandidates.length}</span></p>
              <span>DESLIZE PARA EXPLORAR <ChevronRight size={16} strokeWidth={1.5} /></span>
            </div>
            <p className="featured-rotation-note" aria-live="polite">{archiveFilteredDrawings.length} de {featuredDrawings.length} imagens · próxima troca em {archiveSelectionCountdown.days}d {String(archiveSelectionCountdown.hours).padStart(2, "0")}h {String(archiveSelectionCountdown.minutes).padStart(2, "0")}min · <time dateTime={new Date(nextArchiveSelectionAt).toISOString()}>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(nextArchiveSelectionAt))}</time></p>
            <div className="archive-selection-filters" aria-label="Filtros da Seleção do Arquivo"><label>Família<select value={archiveFamilyFilter} onChange={(event) => setArchiveFamilyFilter(event.target.value)}><option value="all">Todas</option>{featuredDrawings.map((drawing) => <option key={drawing.category} value={drawing.category}>{categoryLabels[drawing.category]}</option>)}</select></label><label>Estilo<select value={archiveStyleFilter} onChange={(event) => setArchiveStyleFilter(event.target.value)}><option value="all">Todos</option>{archiveStyleOptions.map((style) => <option key={style} value={style}>{style}</option>)}</select></label>{(archiveFamilyFilter !== "all" || archiveStyleFilter !== "all") && <button type="button" onClick={() => { setArchiveFamilyFilter("all"); setArchiveStyleFilter("all"); }}>Limpar</button>}</div>
            <div className="featured-scroll">
              {archiveFilteredDrawings.map((drawing, index) => (
                <article className="featured-card" key={drawing.id}>
                  <button className="featured-card-open" type="button" onClick={() => openDrawing(drawing)} >
                    <span className="featured-card-number">{String(index + 1).padStart(2, "0")}</span>
                    <div className="featured-image-wrap"><LoadingImage src={drawing.url} alt={`${categoryLabels[drawing.category]} — desenho de tatuagem`} /><span className={`availability-badge ${getAvailabilityClass(drawing.status)}`} data-tooltip={getAvailabilityLabel(drawing.status)} title={`Disponibilidade: ${getAvailabilityLabel(drawing.status)}`} aria-label={`Disponibilidade: ${getAvailabilityLabel(drawing.status)}`}><i /> {getAvailabilityLabel(drawing.status)}</span><span className="featured-hover-info"><b>{getEditorialTitle(drawing)}</b><small>{categoryDescriptors[drawing.category]} <ArrowUpRight size={13} strokeWidth={1.25} /></small></span></div>
                    <span className="featured-card-label">{categoryLabels[drawing.category]}</span>
                    <span className="featured-card-title">{getEditorialTitle(drawing)}</span>
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="flashs-section dark-section" id="flashs" aria-labelledby="flashs-title">
            <div className="flashs-topline">
              <div className="section-marker section-marker-dark"><span>02</span><i /></div>
              <div className="flashs-heading"><p className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> COLEÇÃO INDEPENDENTE <span className="eyebrow-number">{activeFlashDrawings.length} DESTAQUES / {flashDrawings.length} ESTUDOS</span></p><h2 id="flashs-title">Flashs<br /><em>para escolher.</em></h2><p>Desenhos fechados, feitos para encontrar a pele certa. {hasFlashRotation ? "A seleção muda automaticamente a cada três dias." : "O acervo completo está em destaque nesta seleção."}</p></div>
              <div className="flashs-index"><span>ARQ.</span><b>02</b><i /></div><div className="flash-countdown" aria-live="polite">{hasFlashRotation ? <><span>PRÓXIMA TROCA EM</span><div><strong>{String(flashCountdown.days).padStart(2, "0")}</strong><small>dias</small><strong>{String(flashCountdown.hours).padStart(2, "0")}</strong><small>h</small><strong>{String(flashCountdown.minutes).padStart(2, "0")}</strong><small>min</small><strong>{String(flashCountdown.seconds).padStart(2, "0")}</strong><small>s</small></div><time dateTime={new Date(nextFlashRotationAt).toISOString()}>Troca em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(nextFlashRotationAt))}</time></> : <div className="flash-complete-notice"><small>ACERVO COMPLETO</small><strong>{flashDrawings.length} / {flashDrawings.length}</strong><span>Todos os Flashs estão em destaque.</span></div>}</div>
            </div>
            <div className="flashs-grid">
              {(searchTerm.trim() ? filteredFlashDrawings : activeFlashDrawings).map((drawing, index) => (
                <button className="flash-card" key={drawing.id} onClick={() => openDrawing(drawing)} ><div className="flash-image"><LoadingImage src={drawing.url} alt={`Flash ${index + 1} — desenho de tatuagem`} /><span className={`availability-badge ${getAvailabilityClass(drawing.status)}`} data-tooltip={getAvailabilityLabel(drawing.status)} title={`Disponibilidade: ${getAvailabilityLabel(drawing.status)}`} aria-label={`Disponibilidade: ${getAvailabilityLabel(drawing.status)}`}><i /> {getAvailabilityLabel(drawing.status)}</span><span className="drawing-hover-info"><b>{getEditorialTitle(drawing)}</b><small>Flash / {categoryLabels[drawing.category]} <ArrowUpRight size={14} strokeWidth={1.25} /></small></span></div><div className="flash-caption"><span>FLASH {String(index + 1).padStart(2, "0")}</span><span>{categoryDescriptors[drawing.category]}</span><span className={`flash-status ${getAvailabilityClass(drawing.status)}`} data-tooltip={getAvailabilityLabel(drawing.status)} title={`Disponibilidade: ${getAvailabilityLabel(drawing.status)}`} aria-label={`Disponibilidade: ${getAvailabilityLabel(drawing.status)}`}><i /> {getAvailabilityLabel(drawing.status)}</span></div></button>
              ))}
            </div>
            <div className="flashs-archive"><div className="flashs-archive-head"><p className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> ARQUIVO COMPLETO <span className="eyebrow-number">{flashDrawings.length} DESENHOS</span></p><span>{hasFlashRotation ? "A seleção acima muda a cada três dias; explore o arquivo em lotes menores." : "Os oito estudos do acervo estão em destaque; explore cada desenho com calma."}</span></div><div className="flashs-grid flashs-archive-grid">
              {flashArchiveDrawings.map((drawing, index) => (
                <button className="flash-card" key={drawing.id} onClick={() => openDrawing(drawing)} ><div className="flash-image"><LoadingImage src={drawing.url} alt={`Flash ${index + 1} do arquivo — desenho de tatuagem`} /><span className={`availability-badge ${getAvailabilityClass(drawing.status)}`} data-tooltip={getAvailabilityLabel(drawing.status)} title={`Disponibilidade: ${getAvailabilityLabel(drawing.status)}`} aria-label={`Disponibilidade: ${getAvailabilityLabel(drawing.status)}`}><i /> {getAvailabilityLabel(drawing.status)}</span><span className="drawing-hover-info"><b>{getEditorialTitle(drawing)}</b><small>Flash / {categoryLabels[drawing.category]} <ArrowUpRight size={14} strokeWidth={1.25} /></small></span></div><div className="flash-caption"><span>ARQUIVO {String(index + 1).padStart(2, "0")}</span><span>{categoryDescriptors[drawing.category]}</span><span className={`flash-status ${getAvailabilityClass(drawing.status)}`} data-tooltip={getAvailabilityLabel(drawing.status)} title={`Disponibilidade: ${getAvailabilityLabel(drawing.status)}`} aria-label={`Disponibilidade: ${getAvailabilityLabel(drawing.status)}`}><i /> {getAvailabilityLabel(drawing.status)}</span></div></button>
              ))}
            </div>{hasMoreFlashDrawings && <button type="button" className="flash-load-more" onClick={() => setFlashVisibleCount((count) => Math.min(count + FLASH_ARCHIVE_PAGE_SIZE, flashDrawings.length))}>Carregar mais <Plus size={15} strokeWidth={1.5} /><span>{flashVisibleCount} / {flashDrawings.length}</span></button>}</div>
          </section>

          <section className="catalog-section paper-section" id="arquivo" aria-labelledby="catalog-title">
            <div className="catalog-topline">
              <h2 id="catalog-title">Arquivo<br /><em>completo</em></h2>
              <p>Uma coleção em movimento.<br />Clique em qualquer prancha para ampliar.</p>
            </div>
            <div className={`catalog-spread${spotlightTransitioning ? " spotlight-is-changing" : ""}`}>
              <button className="spotlight-card" onClick={() => { setLightboxScopeIds(null); setSelectedDrawing(spotlightDrawing); }}>
                <div className="spotlight-image"><LoadingImage src={spotlightDrawing.url} alt={`${categoryLabels[spotlightDrawing.category]} — prancha em destaque`} /><span className={`availability-badge ${getAvailabilityClass(spotlightDrawing.status)}`}><i /> {getAvailabilityLabel(spotlightDrawing.status)}</span></div>
                <div className="spotlight-footer"><span>PRANCHA EM DESTAQUE / {categoryLabels[spotlightDrawing.category]}</span><ArrowUpRight size={17} strokeWidth={1.25} /></div>
              </button>
              <div className="spotlight-note">
                <span className="catalog-stamp"><img src={logoUrl} alt="" /><b>01</b></span>
                <p className="eyebrow"><span className="eyebrow-dot vermilion" /> FICHA DE ARQUIVO</p>
                <h3>{getEditorialTitle(spotlightDrawing)}</h3>
                <p className="spotlight-description">{categoryDescriptors[spotlightDrawing.category]}<br />um estudo para ganhar corpo, escala e outra vida.</p>
                <div className="spec-list"><span><b>coleção</b>{categoryLabels[spotlightDrawing.category]}</span><span><b>formato</b>{spotlightDrawing.width} × {spotlightDrawing.height}</span><span><b>estado</b>{getAvailabilityLabel(spotlightDrawing.status)}</span></div>
                <div className="spotlight-thumbnails" aria-label="Escolher imagem da coleção">{spotlightPool.map((drawing, index) => <button type="button" key={drawing.id} className={index === spotlightPosition ? "is-active" : ""} onClick={() => selectSpotlight(index)} aria-label={`Exibir ${getEditorialTitle(drawing)}`} aria-current={index === spotlightPosition ? "true" : undefined}><LoadingImage src={drawing.url} alt="" /><span className="spotlight-thumbnail-title" aria-hidden="true">{getEditorialTitle(drawing)}</span></button>)}</div><div className="spotlight-series-nav" aria-label="Navegar pelas séries da ficha de arquivo"><span>SÉRIE {String(spotlightPosition + 1).padStart(2, "0")} / {String(spotlightPool.length).padStart(2, "0")}</span><div><button type="button" onClick={() => moveSpotlight(-1)} disabled={spotlightPool.length < 2} aria-label="Série anterior"><ChevronLeft size={15} strokeWidth={1.5} /></button><button type="button" onClick={() => moveSpotlight(1)} disabled={spotlightPool.length < 2} aria-label="Próxima série"><ChevronRight size={15} strokeWidth={1.5} /></button></div></div>
              </div>
            </div>
            <div className="filter-shell">
              <div className="filter-label">FILTRAR POR <Minus size={14} /></div>
              <div className="filter-tools">
                <label className="search-field"><Search size={14} strokeWidth={1.5} /><span className="sr-only">Buscar por desenho, Flash ou família visual</span><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar desenho ou Flash" /></label>
                <div className="filter-group">
                  <span className="filter-group-label">Coleções</span>
                  <div className="filter-scroll collection-scroll" role="tablist" aria-label="Filtrar por coleção">
                    <button className={activeCategory === "all" ? "filter-button active" : "filter-button"} onClick={clearCatalogFilters} role="tab" aria-selected={activeCategory === "all"}>Arquivo completo <span>{visibleDrawings.length}</span></button>
                    <button className="filter-button" onClick={() => scrollToId("flashs")} role="tab" aria-selected="false">Flashs <span>{flashDrawings.length}</span></button>
                  </div>
                </div>
                <div className="filter-group">
                  <span className="filter-group-label">Famílias visuais</span>
                  <div className="filter-scroll" role="tablist" aria-label="Filtrar por família visual">
                    {categoryOrder.filter((category) => category !== "VIkings" && !flashCategories.has(category)).map((category) => (
                      <button key={category} className={activeCategory === category ? "filter-button active" : "filter-button"} onClick={() => changeCategory(category)} role="tab" aria-selected={activeCategory === category}>{categoryLabels[category]} <span>{visibleDrawings.filter((drawing) => drawing.category === category).length}</span></button>
                    ))}
                  </div>
                </div>
                <div className="catalog-filter-options">
                  <label>Disponibilidade<select value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value as AvailabilityFilter)}><option value="all">Todas</option><option value="Disponível">Disponível</option><option value="Reservado">Reservado</option><option value="Indisponível">Indisponível</option></select></label>
                  <label>Ordenar<select value={catalogSort} onChange={(event) => setCatalogSort(event.target.value as CatalogSort)}><option value="catalog">Ordem do arquivo</option><option value="recent">Mais recentes</option></select></label>
                  {(activeCategory !== "all" || searchTerm || availabilityFilter !== "all" || catalogSort !== "catalog") && <button type="button" className="filter-clear" onClick={clearCatalogFilters}>Limpar filtros <X size={12} /></button>}
                </div>
              </div>
            </div>
            <div className="catalog-meta" aria-live="polite"><span>{searchTerm.trim() ? `BUSCA: ${searchTerm.trim().toUpperCase()}` : activeCategory === "all" ? "TODAS AS COLEÇÕES" : categoryLabels[activeCategory].toUpperCase()}</span><span>{String(filteredDrawings.length).padStart(3, "0")} ENTRADAS · CLIQUE PARA AMPLIAR</span></div>
            <div className="masonry-grid catalog-parallax-layer" style={{ "--catalog-parallax": `${catalogParallaxOffset}px` } as React.CSSProperties}>
              {catalogSeries.map(({ representative: drawing, drawings: series }, index) => {
                return <article className={`drawing-tile ${getTileClass(index)}`} key={drawing.id}>
                  <button className="drawing-image-button" onClick={() => openDrawingSeries(drawing, series)} aria-label={`Abrir série de ${getEditorialTitle(drawing)}`}>
                    <div className="drawing-frame"><LoadingImage src={drawing.url} alt={`${categoryLabels[drawing.category]} — estudo de tatuagem ${index + 1}`} loading={index < 8 ? "eager" : "lazy"} /><span className={`availability-badge ${getAvailabilityClass(drawing.status)}`} data-tooltip={getAvailabilityLabel(drawing.status)} title={`Disponibilidade: ${getAvailabilityLabel(drawing.status)}`} aria-label={`Disponibilidade: ${getAvailabilityLabel(drawing.status)}`}><i /> {getAvailabilityLabel(drawing.status)}</span><span className="drawing-hover-info"><b>{getEditorialTitle(drawing)}</b><small>{categoryLabels[drawing.category]} <ArrowUpRight size={14} strokeWidth={1.25} /></small></span></div>
                  </button>
                  <div className="drawing-caption"><div className="drawing-caption-main"><strong>{getEditorialTitle(drawing)}</strong><span>{String(index + 1).padStart(2, "0")} / {categoryLabels[drawing.category]}</span></div><div className="drawing-caption-meta"><span>{categoryDescriptors[drawing.category]} · {series.length} artes</span></div></div>
                </article>;
              })}
            </div>
          </section>

          <section className="manifesto-section dark-section" id="manifesto">
            <div className="section-marker section-marker-dark"><span>03</span><i /></div>
            <div className="manifesto-image-wrap"><img src={stampUrl} alt="Guardião de floresta desenhado em grafite e nanquim sobre papel cru" loading="lazy" /><span className="image-note">DETALHE / 02—04</span></div>
            <div className="manifesto-copy">
              <p className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> MANIFESTO <span className="eyebrow-number">NOTA 002</span></p>
              <h2>Desenho bom<br /><em>fica na cabeça.</em></h2>
              <p>Antes da agulha, existe o gesto. O meu trabalho começa no desenho e termina numa peça que parece ter encontrado o seu lugar no corpo. Gosto de linhas que respiram, criaturas com um pouco de estranheza e símbolos que ganham outro sentido quando viram memória.</p>
              <div className="manifesto-signature"><span>ARCANA</span><i>estúdio autoral</i></div>
              <div className="manifesto-registry"><span>REGISTRO</span><b>002</b><i /></div>
            </div>
          </section>


          <section className="contact-section dark-section" id="contato">
            <div className="contact-image-wrap"><img src={studioUrl} alt="Totem ritual autoral desenhado em grafite e nanquim sobre papel cru" loading="lazy" /><div className="contact-image-caption">ARCANA / STUDIO NOTES / 2026</div></div>
            <div className="contact-copy"><div className="section-marker section-marker-dark"><span>04</span><i /></div><p className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> PRÓXIMO CAPÍTULO</p><h2>Escolha uma<br /><em>criatura.</em></h2><p>Se algum desenho abriu uma porta, me escreva. A ideia pode chegar como briefing, referência ou pergunta — o resto a gente descobre no traço.</p>{quoteDrawing && <div className="quote-selected-drawing" role="status"><span>DESENHO SELECIONADO</span><strong>{getEditorialTitle(quoteDrawing)}</strong><button type="button" onClick={() => setQuoteDrawing(null)} aria-label="Remover desenho selecionado">×</button></div>}<form className="quote-form" onSubmit={handleQuoteSubmit}><div className="quote-form-row"><label>Seu nome<input name="name" type="text" value={quoteDraft.name} onChange={(event) => updateQuoteDraft("name", event.target.value)} placeholder="Como posso te chamar?" aria-invalid={Boolean(quoteFieldErrors.name)} required />{quoteFieldErrors.name && <small className="field-error" role="alert">{quoteFieldErrors.name}</small>}</label><label>E-mail<input name="email" type="email" value={quoteDraft.email} onChange={(event) => updateQuoteDraft("email", event.target.value)} placeholder="voce@email.com" aria-invalid={Boolean(quoteFieldErrors.email)} required /></label>{quoteFieldErrors.email && <small className="field-error" role="alert">{quoteFieldErrors.email}</small>}<label>Telefone<input name="phone" type="tel" value={quoteDraft.phone} onChange={(event) => updateQuoteDraft("phone", formatBrazilianPhone(event.target.value))} placeholder="(11) 99999-9999" inputMode="tel" aria-invalid={Boolean(quoteFieldErrors.phone)} required /></label>{quoteFieldErrors.phone && <small className="field-error" role="alert">{quoteFieldErrors.phone}</small>}</div><div className="quote-form-row"><label>Local no corpo<input name="placement" type="text" value={quoteDraft.placement} onChange={(event) => updateQuoteDraft("placement", event.target.value)} placeholder="Ex.: braço, costela..." aria-invalid={Boolean(quoteFieldErrors.placement)} required />{quoteFieldErrors.placement && <small className="field-error" role="alert">{quoteFieldErrors.placement}</small>}</label><label>Tamanho aproximado<input name="size" type="text" value={quoteDraft.size} onChange={(event) => updateQuoteDraft("size", event.target.value)} placeholder="Ex.: 12 cm" aria-invalid={Boolean(quoteFieldErrors.size)} required />{quoteFieldErrors.size && <small className="field-error" role="alert">{quoteFieldErrors.size}</small>}</label></div><label className="date-field">Data sugerida<input name="preferredDate" type="date" value={quoteDraft.preferredDate} onChange={(event) => updateQuoteDraft("preferredDate", event.target.value)} min={new Date().toISOString().split("T")[0]} aria-invalid={Boolean(quoteFieldErrors.preferredDate)} required />{quoteFieldErrors.preferredDate && <small className="field-error" role="alert">{quoteFieldErrors.preferredDate}</small>}</label><label>Ideia / briefing<textarea name="idea" rows={3} value={quoteDraft.idea} onChange={(event) => updateQuoteDraft("idea", event.target.value)} minLength={10} placeholder="Conte a história, referência ou Flash que te chamou." aria-describedby="idea-help" aria-invalid={Boolean(quoteFieldErrors.idea)} required /><small id="idea-help" className={`field-hint${quoteDraft.idea.length < 10 ? " is-warning" : ""}`}>{getQuoteIdeaCounterText(quoteDraft.idea)}</small>{quoteFieldErrors.idea && <small className="field-error" role="alert">{quoteFieldErrors.idea}</small>}</label><label className="file-upload"><input name="references" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleReferenceChange} /><span><Upload size={15} strokeWidth={1.5} /> {referenceFiles.length ? `${referenceFiles.length} referência${referenceFiles.length > 1 ? "s" : ""} selecionada${referenceFiles.length > 1 ? "s" : ""}` : "Anexar referências"}</span><small>PNG, JPG ou WebP / até 5 imagens</small></label>{referencePreviews.length > 0 && <div className="reference-preview-grid" aria-label="Referências selecionadas">{referencePreviews.map((preview, index) => <div className="reference-preview" key={`${preview.file.name}-${preview.file.lastModified}`}><img src={preview.url} alt={`Referência selecionada: ${preview.file.name}`} /><span>{preview.file.name}</span><button type="button" onClick={() => removeReference(index)} aria-label={`Remover ${preview.file.name}`}><X size={13} strokeWidth={1.5} /></button></div>)}</div>}{quoteSavedFeedback && <div className="quote-saved-feedback" role="status" aria-live="polite"><span aria-hidden="true">✓</span> {quoteSavedFeedback === "undone" ? "Última alteração desfeita" : "Alterações salvas"}</div>}{briefingReady && !quoteSent && <div className="briefing-ready" role="status" aria-live="polite"><span className="briefing-ready-mark" aria-hidden="true">✓</span><div><strong>Briefing pronto para envio.</strong><span>Todos os campos obrigatórios foram preenchidos. Revise os dados e envie quando estiver tudo certo.</span></div></div>}<button ref={submitButtonRef} className="contact-button" type="submit" disabled={quoteMutation.isPending || whatsappProcessing}>{quoteMutation.isPending || whatsappProcessing ? <><Loader2 className="spin" size={16} /> {quoteMutation.isPending ? "Salvando briefing…" : "Abrindo WhatsApp…"}</> : <>{quoteSent ? "Enviar novo briefing" : "Enviar briefing"} <ArrowUpRight size={18} strokeWidth={1.25} /></>}</button><button type="button" className="clear-form-button" onClick={clearQuoteForm}>Limpar formulário</button>{quoteSent && <div className="form-success" aria-live="polite" role="status"><span className="success-mark">✓</span><div><strong>Briefing recebido.</strong><span>Suas referências foram anexadas e o WhatsApp foi aberto com o briefing pronto.</span>{lastBriefingUrl && <button type="button" className="resend-whatsapp-button" onClick={resendBriefingToWhatsApp}><MessageCircle size={14} /> Reenviar para o WhatsApp</button>}</div></div>}{quoteError && <p className="form-error" role="alert">{quoteError}</p>}</form><span className="contact-small">{quoteEmail} <span>●</span> resposta em até 3 dias úteis</span></div>
          </section>

          <section className="faq-section paper-section" id="faq" aria-labelledby="faq-title"><div className="section-marker"><span>05</span><i /></div><div className="faq-heading"><p className="eyebrow"><span className="eyebrow-dot vermilion" /> DÚVIDAS FREQUENTES</p><h2 id="faq-title">Antes do<br /><em>primeiro traço.</em></h2><p>Algumas respostas para você chegar ao agendamento com mais clareza.</p></div><div className="faq-list"><details open><summary>Como funciona o agendamento?</summary><p>Você envia o briefing pelo formulário, escolhe uma data sugerida e conta o que deseja. Eu retorno para alinhar disponibilidade, valor e próximos passos.</p></details><details><summary>Posso escolher um desenho do arquivo?</summary><p>Sim. Você pode indicar uma peça do acervo ou usar o arquivo como ponto de partida para uma composição pensada para o seu corpo.</p></details><details><summary>Os Flashs podem ser adaptados?</summary><p>Os Flashs são desenhos fechados. Pequenos ajustes de escala e posicionamento podem ser conversados, respeitando a linguagem original da peça.</p></details><details><summary>Quanto tempo antes devo enviar o briefing?</summary><p>Quanto antes você enviar o briefing, melhor para encontrar uma data com calma. A data informada no formulário é uma preferência, não uma confirmação.</p></details><details><summary>Posso enviar imagens de referência?</summary><p>Sim. Anexe até cinco imagens JPG, PNG ou WebP no formulário para contextualizar a ideia, o local e a atmosfera que você procura.</p></details></div></section>
        </main>

        <footer className="footer">
          <a className="footer-brand" href="#top"><img src={logoUrl} alt="" /><span>ARCANA</span></a>
          <p>UM ARQUIVO DE DESENHOS PARA A PELE.</p>
          <div className="footer-links"><a href="#obra">Obra</a><a href="#flashs">Flashs</a><a href="#manifesto">Manifesto</a><a href="#contato">Contato</a><a href="#faq">Antes do traço</a></div>
          <div ref={footerSocialRef} className={`footer-socials${footerSocialsVisible ? " is-visible" : ""}`} aria-label="Redes sociais do estúdio"><a href={instagramUrl} target="_blank" rel="noreferrer"><Instagram size={14} strokeWidth={1.5} /> Instagram</a><a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={14} strokeWidth={1.5} /> WhatsApp</a></div>
          <button className="back-top" onClick={() => scrollToId("top")} aria-label="Voltar ao topo"><ChevronLeft size={16} /> topo</button>
        </footer>
        <div className="floating-contact-actions" aria-label="Contato rápido">
          <a className="floating-contact floating-instagram" href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Abrir Instagram @mukkatattoo" title="Instagram @mukkatattoo"><Instagram size={18} strokeWidth={1.5} /></a>
          <div className="floating-whatsapp-wrap"><span id="floating-whatsapp-tooltip" className="floating-whatsapp-tooltip" role="tooltip">Faça seu orçamento</span><a className="floating-contact floating-whatsapp" href={whatsappFloatingUrl} target="_blank" rel="noreferrer" aria-describedby="floating-whatsapp-tooltip" aria-label="Abrir WhatsApp" title="Faça seu orçamento"><MessageCircle size={18} strokeWidth={1.5} /></a></div>
        </div>
      </div>

      {quoteReviewOpen && pendingQuoteReview && (
        <div className="quote-confirmation-backdrop quote-review-backdrop" role="presentation" onClick={closeQuoteReview}>
          <div className="quote-review-dialog-shell">
          <div className="quote-confirmation-modal quote-review-modal" role="dialog" aria-modal="true" aria-labelledby="quote-review-title" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="quote-confirmation-close" onClick={closeQuoteReview} aria-label="Voltar para editar o briefing">×</button>
            <span className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> ÚLTIMA CONFERÊNCIA</span>
            <h2 id="quote-review-title">Revise<br /><em>seu briefing.</em></h2>
            <p>Confira os dados abaixo. O WhatsApp só será aberto depois que você confirmar o envio.</p>
            {quoteSavedFeedback && <div className="quote-saved-feedback quote-review-saved-feedback" role="status" aria-live="polite"><span aria-hidden="true">✓</span> {quoteSavedFeedback === "undone" ? "Última alteração desfeita" : "Alterações salvas"}</div>}
            <div className="quote-confirmation-summary quote-review-summary" aria-label="Resumo do briefing para revisão">
              <label className={`quote-review-field${recentlyChangedFields.has("name") ? " is-recently-changed" : ""}`}><span>CLIENTE {recentlyChangedFields.has("name") && <i className="field-change-indicator" aria-label="Alterado recentemente" title="Alterado recentemente" />}</span><input type="text" value={pendingQuoteReview.name} onChange={(event) => updatePendingQuoteField("name", event.target.value)} aria-invalid={Boolean(quoteFieldErrors.name)} aria-describedby="review-name-error" autoComplete="name" />{quoteFieldErrors.name && <small id="review-name-error" className="field-error" role="alert">{quoteFieldErrors.name}</small>}</label>
              <label className={`quote-review-field${recentlyChangedFields.has("email") ? " is-recently-changed" : ""}`}><span>E-MAIL {recentlyChangedFields.has("email") && <i className="field-change-indicator" aria-label="Alterado recentemente" title="Alterado recentemente" />}</span><input type="email" value={pendingQuoteReview.email} onChange={(event) => updatePendingQuoteField("email", event.target.value)} aria-invalid={Boolean(quoteFieldErrors.email)} aria-describedby="review-email-error" autoComplete="email" />{quoteFieldErrors.email && <small id="review-email-error" className="field-error" role="alert">{quoteFieldErrors.email}</small>}</label>
              <label className={`quote-review-field${recentlyChangedFields.has("phone") ? " is-recently-changed" : ""}`}><span>TELEFONE {recentlyChangedFields.has("phone") && <i className="field-change-indicator" aria-label="Alterado recentemente" title="Alterado recentemente" />}</span><input type="tel" value={pendingQuoteReview.phone} onChange={(event) => updatePendingQuoteField("phone", formatBrazilianPhone(event.target.value))} aria-invalid={Boolean(quoteFieldErrors.phone)} aria-describedby="review-phone-error" inputMode="tel" autoComplete="tel" />{quoteFieldErrors.phone && <small id="review-phone-error" className="field-error" role="alert">{quoteFieldErrors.phone}</small>}</label>
              <label className={`quote-review-field${recentlyChangedFields.has("placement") ? " is-recently-changed" : ""}`}><span>LOCAL NO CORPO {recentlyChangedFields.has("placement") && <i className="field-change-indicator" aria-label="Alterado recentemente" title="Alterado recentemente" />}</span><input type="text" value={pendingQuoteReview.placement} onChange={(event) => updatePendingQuoteField("placement", event.target.value)} aria-invalid={Boolean(quoteFieldErrors.placement)} aria-describedby="review-placement-error" />{quoteFieldErrors.placement && <small id="review-placement-error" className="field-error" role="alert">{quoteFieldErrors.placement}</small>}</label>
              <label className={`quote-review-field${recentlyChangedFields.has("size") ? " is-recently-changed" : ""}`}><span>TAMANHO APROXIMADO {recentlyChangedFields.has("size") && <i className="field-change-indicator" aria-label="Alterado recentemente" title="Alterado recentemente" />}</span><input type="text" value={pendingQuoteReview.size} onChange={(event) => updatePendingQuoteField("size", event.target.value)} aria-invalid={Boolean(quoteFieldErrors.size)} aria-describedby="review-size-error" />{quoteFieldErrors.size && <small id="review-size-error" className="field-error" role="alert">{quoteFieldErrors.size}</small>}</label>
              <label className={`quote-review-field${recentlyChangedFields.has("preferredDate") ? " is-recently-changed" : ""}`}><span>DATA SUGERIDA {recentlyChangedFields.has("preferredDate") && <i className="field-change-indicator" aria-label="Alterado recentemente" title="Alterado recentemente" />}</span><input type="date" value={pendingQuoteReview.preferredDate} onChange={(event) => updatePendingQuoteField("preferredDate", event.target.value)} aria-invalid={Boolean(quoteFieldErrors.preferredDate)} aria-describedby="review-date-error" />{quoteFieldErrors.preferredDate && <small id="review-date-error" className="field-error" role="alert">{quoteFieldErrors.preferredDate}</small>}</label>
              {quoteDrawing && <div className="quote-review-field quote-review-static-field"><span>DESENHO</span><strong>{getEditorialTitle(quoteDrawing)}</strong></div>}
              <label className={`quote-review-field quote-summary-idea${recentlyChangedFields.has("idea") ? " is-recently-changed" : ""}`}><span>IDEIA / BRIEFING {recentlyChangedFields.has("idea") && <i className="field-change-indicator" aria-label="Alterado recentemente" title="Alterado recentemente" />}</span><textarea rows={4} value={pendingQuoteReview.idea} onChange={(event) => updatePendingQuoteField("idea", event.target.value)} minLength={10} aria-invalid={Boolean(quoteFieldErrors.idea)} aria-describedby={quoteFieldErrors.idea ? "review-idea-help review-idea-error" : "review-idea-help"} /><small id="review-idea-help" className={`field-hint${pendingQuoteReview.idea.length < 10 ? " is-warning" : ""}`}>{getQuoteIdeaCounterText(pendingQuoteReview.idea)}</small>{quoteFieldErrors.idea && <small id="review-idea-error" className="field-error" role="alert">{quoteFieldErrors.idea}</small>}</label>
              <small>{referenceFiles.length} referência{referenceFiles.length === 1 ? "" : "s"} selecionada{referenceFiles.length === 1 ? "" : "s"}</small>
            </div>
            {referencePreviews.length > 0 && <div className="quote-review-references" aria-label="Prévia das referências anexadas" role="list">{referencePreviews.map((preview, index) => <figure className={`quote-review-reference${referenceDragIndex === index ? " is-dragging" : ""}`} key={`${preview.file.name}-${preview.file.lastModified}`} role="listitem" draggable={!whatsappProcessing} onDragStart={(event) => handleReferenceDragStart(event, index)} onDragOver={handleReferenceDragOver} onDrop={(event) => handleReferenceDrop(event, index)} onDragEnd={handleReferenceDragEnd} aria-label={`Referência ${index + 1}: ${preview.file.name}`}><div className="quote-review-reference-image"><img src={preview.url} alt={`Prévia da referência ${preview.file.name}`} /><button type="button" className="quote-review-reference-remove" onClick={() => requestReferenceRemoval(index)} disabled={whatsappProcessing} data-reference-index={index} aria-label={`Remover a referência ${preview.file.name}`} title="Remover referência"><X size={13} strokeWidth={1.6} /></button></div><figcaption><strong>{preview.file.name}</strong><span>{formatReferenceFileSize(preview.file.size)} · {formatReferenceFileType(preview.file)}</span><div className="quote-review-reference-note-wrap"><input className={`quote-review-reference-note${recentlyChangedFields.has(`reference-note-${index}`) ? " is-recently-changed" : ""}`} type="text" value={referenceNotes[index] ?? ""} onChange={(event) => updateReferenceNote(index, event.target.value)} maxLength={160} placeholder="Nota opcional" aria-label={`Nota para a referência ${preview.file.name}`} />{recentlyChangedFields.has(`reference-note-${index}`) && <span className="field-change-indicator reference-change-indicator" aria-label="Nota alterada recentemente" title="Nota alterada recentemente" />}</div><div className="quote-review-reference-actions"><button type="button" onClick={() => moveReference(index, -1)} disabled={whatsappProcessing || index === 0} aria-label={`Mover ${preview.file.name} para a esquerda`} title="Mover para a esquerda"><ChevronLeft size={12} strokeWidth={1.5} /></button><button type="button" onClick={() => moveReference(index, 1)} disabled={whatsappProcessing || index === referencePreviews.length - 1} aria-label={`Mover ${preview.file.name} para a direita`} title="Mover para a direita"><ChevronRight size={12} strokeWidth={1.5} /></button></div></figcaption></figure>)}</div>}
            <div className="quote-review-actions"><button type="button" className="quote-undo-button" onClick={undoLastBriefingChange} disabled={briefingChangeHistory.length === 0 || whatsappProcessing} aria-label="Desfazer a última alteração" title={briefingChangeHistory.length ? "Desfazer a última alteração" : "Nenhuma alteração para desfazer"}><Undo2 size={14} /> Desfazer última alteração <kbd>⌘/Ctrl Z</kbd></button><button type="button" className="clear-cancel-button" onClick={closeQuoteReview} disabled={whatsappProcessing}>Voltar e editar</button><button type="button" className="contact-button" onClick={submitReviewedQuote} disabled={whatsappProcessing}>{whatsappProcessing ? <><Loader2 className="spin" size={16} /> Preparando envio…</> : <>Confirmar e abrir WhatsApp <ArrowUpRight size={16} /></>}</button></div>
            {quoteError && <p className="form-error" role="alert">{quoteError}</p>}
          </div>
          <aside className="briefing-change-panel" aria-label="Resumo das alterações do briefing" onClick={(event) => event.stopPropagation()}>
            <span className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> RASTRO DE EDIÇÃO</span>
            <h3>O que<br /><em>mudou.</em></h3>
            <p className="briefing-change-panel-intro">Acompanhe as alterações feitas antes de abrir o WhatsApp.</p>
            {briefingChangeHistory.length > 0 ? <ol className="briefing-change-list">{briefingChangeHistory.map((change, index) => <li key={change.id}><span className="briefing-change-index">{String(index + 1).padStart(2, "0")}</span><div><strong>{change.label}</strong><span className="briefing-change-values"><span>{change.previousValue || "vazio"}</span><i aria-hidden="true">→</i><span>{change.nextValue || "vazio"}</span></span></div></li>)}</ol> : <p className="briefing-change-empty">Nenhuma alteração foi feita nesta revisão.</p>}
            <div className="briefing-change-panel-footer"><span>Atalho</span><kbd>⌘/Ctrl Z</kbd><small>desfaz a última alteração</small></div>
          </aside>
          </div>
        </div>
      )}

      {referenceRemovalIndex !== null && referenceFiles[referenceRemovalIndex] && (
        <div className="quote-confirmation-backdrop reference-removal-backdrop" role="presentation" onClick={closeReferenceRemovalConfirm}>
          <div className="quote-confirmation-modal reference-removal-modal" role="dialog" aria-modal="true" aria-labelledby="reference-removal-title" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="quote-confirmation-close" onClick={closeReferenceRemovalConfirm} aria-label="Manter referência">×</button>
            <span className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> NOTA DE CUIDADO</span>
            <h2 id="reference-removal-title">Remover<br /><em>referência?</em></h2>
            <p>A imagem “{referenceFiles[referenceRemovalIndex].name}” será retirada deste briefing antes do envio.</p>
            <div className="clear-confirmation-actions"><button type="button" className="clear-cancel-button" onClick={closeReferenceRemovalConfirm}>Manter imagem</button><button type="button" className="clear-danger-button" onClick={confirmReferenceRemoval}>Remover imagem</button></div>
          </div>
        </div>
      )}

      {quoteConfirmationOpen && (
        <div className="quote-confirmation-backdrop" role="presentation" onClick={closeQuoteConfirmation}>
          <div className="quote-confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="quote-confirmation-title" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="quote-confirmation-close" onClick={closeQuoteConfirmation} aria-label="Fechar confirmação">×</button>
            <span className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> CAPÍTULO ENVIADO</span>
            <h2 id="quote-confirmation-title">Briefing<br /><em>em trânsito.</em></h2>
            <p>Seu pedido foi registrado e o WhatsApp foi aberto com a mensagem pronta para confirmação.</p>
            {submittedQuote && <div className="quote-confirmation-summary" aria-label="Resumo do briefing enviado"><div><span>CLIENTE</span><strong>{submittedQuote.name}</strong></div><div><span>CONTATO</span><strong>{submittedQuote.phone}</strong></div><div><span>LOCAL / TAMANHO</span><strong>{submittedQuote.placement} · {submittedQuote.size}</strong></div><div><span>DATA SUGERIDA</span><strong>{submittedQuote.preferredDate}</strong></div>{submittedQuote.drawing && <div><span>DESENHO</span><strong>{submittedQuote.drawing}</strong></div>}<div className="quote-summary-idea"><span>IDEIA</span><strong>{submittedQuote.idea}</strong></div><small>{submittedQuote.referenceCount} referência{submittedQuote.referenceCount === 1 ? "" : "s"} anexada{submittedQuote.referenceCount === 1 ? "" : "s"}</small></div>}
            {submittedQuote && <button type="button" className="copy-summary-button" onClick={copySubmittedSummary}><Copy size={14} /> {copySummaryStatus === "copied" ? "Resumo copiado" : "Copiar resumo"}</button>}{lastBriefingUrl && <button type="button" className="resend-whatsapp-button" onClick={resendBriefingToWhatsApp}><MessageCircle size={14} /> Reenviar briefing</button>}
          </div>
        </div>
      )}

      {clearConfirmOpen && (
        <div className="quote-confirmation-backdrop" role="presentation" onClick={() => setClearConfirmOpen(false)}>
          <div className="quote-confirmation-modal clear-confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="clear-confirmation-title" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="quote-confirmation-close" onClick={() => setClearConfirmOpen(false)} aria-label="Cancelar limpeza">×</button>
            <span className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> NOTA DE CUIDADO</span>
            <h2 id="clear-confirmation-title">Apagar<br /><em>o rascunho?</em></h2>
            <p>Os dados preenchidos e as referências selecionadas serão removidos deste navegador. Essa ação não pode ser desfeita.</p>
            <div className="clear-confirmation-actions"><button type="button" className="clear-cancel-button" onClick={() => setClearConfirmOpen(false)}>Manter dados</button><button type="button" className="clear-danger-button" onClick={() => { setClearConfirmOpen(false); resetQuoteForm(); }}>Apagar formulário</button></div>
          </div>
        </div>
      )}

      {selectedDrawing && (
        <div className={`art-modal${lightboxImmersive ? " is-immersive" : ""}`} role="dialog" aria-modal="true" aria-label={lightboxImmersive ? "Visualização imersiva do desenho" : "Visualização do desenho"} onClick={closeLightbox}>
          <div className={`art-modal-inner${lightboxZoomed ? " is-zoomed" : ""}${lightboxImmersive ? " is-immersive" : ""}`} data-lightbox-mode={lightboxImmersive ? "immersive" : "standard"} onClick={(event) => event.stopPropagation()} onTouchStart={handleLightboxTouchStart} onTouchMove={handleLightboxTouchMove} onTouchEnd={handleLightboxTouchEnd}>
            <button className="modal-close" onClick={closeLightbox} aria-label="Fechar visualização"><X size={20} strokeWidth={1.25} /></button><button className="modal-immersive-toggle" type="button" onClick={toggleImmersiveView} aria-pressed={lightboxImmersive} aria-label={lightboxImmersive ? "Sair da visualização em tela cheia" : "Abrir visualização em tela cheia"} title={lightboxImmersive ? "Sair da tela cheia" : "Ver arte em tela cheia"}>{lightboxImmersive ? <Minimize2 size={17} strokeWidth={1.35} /> : <Fullscreen size={17} strokeWidth={1.35} />}</button>{lightboxImmersive && <><button className="modal-immersive-share" type="button" onClick={() => setShareMenuOpen((open) => !open)} aria-expanded={shareMenuOpen} aria-haspopup="menu" aria-label="Compartilhar esta arte nas redes sociais" title="Compartilhar arte"><Share2 size={17} strokeWidth={1.35} /></button><button className="modal-immersive-zoom" type="button" onClick={toggleLightboxZoom} aria-pressed={lightboxZoomed} aria-label={lightboxZoomed ? "Reduzir arte" : "Ampliar arte"} title={lightboxZoomed ? "Reduzir arte" : "Ampliar arte"}>{lightboxZoomed ? <ZoomOut size={17} strokeWidth={1.35} /> : <ZoomIn size={17} strokeWidth={1.35} />}</button></>}{lightboxImmersive && shareMenuOpen && <div className="social-share-menu social-share-menu-immersive" role="menu" aria-label="Redes sociais da arte"><button type="button" role="menuitem" onClick={() => shareDrawingToSocial("whatsapp")}><MessageCircle size={14} /> WhatsApp</button><button type="button" role="menuitem" onClick={() => shareDrawingToSocial("facebook")}><span className="social-letter">f</span> Facebook</button><button type="button" role="menuitem" onClick={() => shareDrawingToSocial("tiktok")}><span className="social-letter">♪</span> TikTok · copiar link</button><button type="button" role="menuitem" onClick={() => shareDrawingToSocial("instagram")}><Instagram size={14} /> Instagram · copiar link</button><button type="button" role="menuitem" onClick={copyDrawingLink}><Copy size={14} /> {copyStatus === "copied" ? "Link copiado" : "Copiar link"}</button></div>}
            <button className="modal-nav modal-prev" onClick={() => moveLightbox(-1)} disabled={lightboxDrawings.length < 2} aria-label="Desenho anterior"><ChevronLeft size={24} strokeWidth={1.25} /></button>
            <div className="modal-image-wrap" onClick={handleLightboxDoubleTap} style={{ transform: `translate(${lightboxPan.x}px, ${lightboxPan.y}px)` }}>{lightboxDragDirection && <span className={`lightbox-drag-indicator is-${lightboxDragDirection}`} aria-live="polite">{lightboxDragDirection === "left" ? "←" : lightboxDragDirection === "right" ? "→" : "↓"}</span>}{showGestureHint && <div className="lightbox-gesture-hint" role="status" aria-live="polite"><strong>Gestos disponíveis</strong><span>Deslize para navegar · arraste para mover · use dois dedos para ampliar</span><button type="button" className="lightbox-gesture-hint-close" onClick={() => setShowGestureHint(false)} aria-label="Fechar dica de gestos"><X size={14} strokeWidth={1.5} /></button><button type="button" onClick={() => setShowGestureHint(false)}>Entendi</button></div>}<LoadingImage className={lightboxZoomed ? "lightbox-image-zoomed" : undefined} style={{ transform: `scale(${lightboxZoomScale})` }} src={selectedDrawing.url} alt={`${categoryLabels[selectedDrawing.category]} — ${getEditorialTitle(selectedDrawing)} ampliado`} onLoad={() => setLightboxImageLoading(false)} />{lightboxImageLoading && <span className="lightbox-loading-indicator" role="status" aria-live="polite"><Loader2 className="spin" size={18} /> Carregando desenho…</span>}</div><p className="lightbox-caption"><strong>{getEditorialTitle(selectedDrawing)}</strong><span>{categoryLabels[selectedDrawing.category]} · {categoryDescriptors[selectedDrawing.category]}</span></p>
            <button className="modal-nav modal-next" onClick={() => moveLightbox(1)} disabled={lightboxDrawings.length < 2} aria-label="Próximo desenho"><ChevronRight size={24} strokeWidth={1.25} /></button>
            <div className="modal-info"><div><span className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> {categoryLabels[selectedDrawing.category]}</span><h2>{getEditorialTitle(selectedDrawing)}</h2><p>{categoryDescriptors[selectedDrawing.category]} <span>·</span> peça autoral</p></div><div className="modal-actions"><div className="modal-share-row"><button className="modal-share modal-quote" type="button" onClick={() => chooseDrawingForQuote(selectedDrawing)} aria-label="Solicitar orçamento deste desenho"><ArrowUpRight size={15} strokeWidth={1.5} /><span>Agendar</span></button><button className="modal-share" type="button" onClick={() => setShareMenuOpen((open) => !open)} aria-expanded={shareMenuOpen} aria-haspopup="menu" aria-label="Compartilhar este desenho nas redes sociais"><Share2 size={15} strokeWidth={1.5} /><span>Compartilhar</span></button>{shareMenuOpen && <div className="social-share-menu" role="menu" aria-label="Redes sociais"><button type="button" role="menuitem" onClick={() => shareDrawingToSocial("whatsapp")}><MessageCircle size={14} /> WhatsApp</button><button type="button" role="menuitem" onClick={() => shareDrawingToSocial("facebook")}><span className="social-letter">f</span> Facebook</button><button type="button" role="menuitem" onClick={() => shareDrawingToSocial("tiktok")}><span className="social-letter">♪</span> TikTok · copiar link</button><button type="button" role="menuitem" onClick={() => shareDrawingToSocial("instagram")}><Instagram size={14} /> Instagram · copiar link</button></div>}<button className="modal-share" type="button" onClick={copyDrawingLink} aria-label="Copiar link deste desenho"><Copy size={15} strokeWidth={1.5} /><span>{copyStatus === "copied" ? "Copiado" : "Copiar Link"}</span></button></div><span className="modal-id">{selectedDrawing.width} × {selectedDrawing.height}<br />ARQ. {selectedDrawing.id.slice(0, 6).toUpperCase()}<br /><small>{Math.max(1, lightboxDrawings.findIndex((drawing) => drawing.id === selectedDrawing.id) + 1)} / {lightboxDrawings.length}</small></span></div></div>
          </div>
        </div>
      )}
    </div>
  );
}
