"use client";
import {
  Button,
  Link as ALink,
  H1,
  H2,
  H3,
  P,
  Span,
  Div,
  Section,
  Ul,
  Li,
  Label,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/general/primitives";

import ProductCardWithCarousel from "@/components/ui/general/cards/carousel-card";
import HorizontalCard from "@/components/ui/general/cards/horizontal-card";
import VerticalCard from "@/components/ui/general/cards/vertical-card";
import HorizontalCardTemplate from "@/components/ui/general/cards/horizontal-template-card";
import HorizontalAddCard from "@/components/ui/general/cards/horizontal-add-card";
import FeatureCard from "@/components/ui/general/cards/feature-card";
import Pagination from "@/components/ui/general/pagination/pagination";
import FilterUpBar from "@/components/ui/general/search/filter-up-bar";
import { Modal as GenericModal, DangerModal } from "@/components/ui/general/modals/Modal";
import ErrorDiv from "@/components/ui/general/error-div";
import LanguageSwitcher from "@/components/ui/general/language-switcher";
import SocialButton from "@/components/ui/general/primitives/social-button";
import ReportButton from "@/components/ui/general/primitives/report-button";
import CardInCard from "@/components/ui/general/cards/card-in-card";
import VerticalAddCard from "@/components/ui/general/cards/vertical-add-card";
import GalleryCarousel from "@/components/ui/general/gallery/gallery-with-carousel";
import MapEmbed from "@/components/ui/general/maps/map-embed";
import MapMarkers from "@/components/ui/general/maps/multi-pin-map";
import ModalMultiPinMap from "@/components/ui/general/modals/multi-pin-map-modal";
import GeneralScrollableFormModal from "@/components/ui/general/modals/general-scrollable-form-modal";
import TableVerticalExpandable from "@/components/ui/general/table/table-vertical-expandable";
import VerticalExpandableTableWithHeader from "@/components/ui/general/table/vertical-expandable-with-header";
import CommentInput from "@/components/ui/general/comments/comment-input";
import CommentList from "@/components/ui/general/comments/comment-list";

//Todo: creeaza o pagina components unde am toate ocmponentele sa nu 
// le am in home page pt a ma ajuta la dezvoltare

import React from "react";
import { useSelector } from "react-redux";
import LoadingSpinner from "@/components/ui/animations/loading-spinner";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from "@/components/ui/general/dropdowns";
import SubNavSearchBar from "@/components/ui/general/search/sub-nav-search-bar";
import DataTable from "@/components/ui/general/table/data-table";
import FilterSidebar from "@/components/ui/general/search/filter-sidebar";
import { useLanguage } from "@/context/language-context";
import Radio from "@/components/ui/general/primitives/radio";
import Container from "@/components/ui/general/layout/container";
import AuthForm from "@/components/ui/general/forms/auth-form";
import GeneralForm from "@/components/ui/general/forms/general-Form";
import AccountSideBar from "@/components/ui/general/account/account-sidebar";
import Footer from "@/components/navigation/general/footer/footer";

const mock = {
  href: "#",
  imageSrc: "/imgs/Screenshot from 2025-07-21 15-40-46.png",
  imageAlt: "bloc",
  title: "Proprietar, CF-INDIVIDUAL. disponibil imediat, bloc locuit, termoizolatie 20 cm",
  description: "Aradului, Timisoara • 2 camere • 52 mp • Etaj 4/11 • 2023 • Comision 0% • Locatie exacta",
  price: "112.844 € + TVA",
};

// Local minimal user icon to avoid external deps
const LocalUserIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={"h-4 w-4"}
    {...props}
  >
    <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
  </svg>
);


export default function ComponentsPage() {
  const { t } = useLanguage();
  const [authType, setAuthType] = React.useState("login");
  const [authLoading, setAuthLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState(null);
  // Demo state for extra components
  const [openMultiMap, setOpenMultiMap] = React.useState(false);
  const [openScrollableForm, setOpenScrollableForm] = React.useState(false);
  const demoMarkers = React.useMemo(() => ([
    { id: 1, lat: 45.7537, lng: 21.2257, label: "Piața Victoriei" },
    { id: 2, lat: 45.7489, lng: 21.2087, label: "Centru Timișoara" },
  ]), []);
  const [commentVal, setCommentVal] = React.useState("");
  const [comments, setComments] = React.useState([
    { id: "c1", message: "comentariu test", created_at: new Date().toISOString(), user_id: 1, author: { name: "Costelus" } },
  ]);
  const addComment = () => {
    const msg = (commentVal || "").trim();
    if (!msg) return;
    setComments((prev) => [
      { id: `c${prev.length + 1}`, message: msg, created_at: new Date().toISOString(), user_id: 2, author: { name: "Dan" } },
      ...prev,
    ]);
    setCommentVal("");
  };
  const deleteComment = (c) => setComments((prev) => prev.filter((x) => x.id !== c.id));
  const editComment = (c) => alert(`Edit: ${c.message}`);
  const [cardTasks, setCardTasks] = React.useState([
    { id: "t1", title: "Config componenta", status: "todo" },
    { id: "t2", title: "Scrie documentație", status: "done" },
  ]);
  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const toggleTask = (task) => setCardTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t));
  const addTask = () => {
    const title = (newTaskTitle || "").trim();
    if (!title) return;
    setCardTasks((prev) => [...prev, { id: `t${prev.length + 1}`, title, status: "todo" }]);
    setNewTaskTitle("");
  };
  const handleAuthSubmit = async (payload) => {
    setAuthError(null);
    setAuthLoading(true);
    // simulate a small delay
    await new Promise((r) => setTimeout(r, 400));
    setAuthLoading(false);
    alert(`${authType} submitted: ${JSON.stringify(payload)}`);
  };
  // Example 1: simple inline onSubmit handler showing success message
  const example1Submit = async (payload) => {
    // simulate async work
    await new Promise((r) => setTimeout(r, 700));
    return { success: true, message: `Saved: ${payload.name || 'no-name'}` };
  };

  // Example 2: demonstrate more complex validation and onSuccess/onError
  const example2Submit = async (payload) => {
    await new Promise((r) => setTimeout(r, 600));
    // handle both plain object payloads and FormData (when files are uploaded)
    let ageVal = null;
    let imagesCount = 0;
    if (typeof FormData !== 'undefined' && payload instanceof FormData) {
      ageVal = payload.get('age');
      const imgs = payload.getAll('images');
      imagesCount = imgs ? imgs.length : 0;
    } else {
      ageVal = payload.age;
      imagesCount = Array.isArray(payload.images) ? payload.images.length : 0;
    }
    // simulate a server-side validation: age must be >= 18
    if (ageVal !== "" && ageVal != null && Number(ageVal) < 18) {
      return { success: false, message: "Age must be at least 18 on server" };
    }
    return { success: true, message: `Product saved on server (simulated). Images: ${imagesCount}` };
  };
  const localUser = useSelector((state) => state.user.accessToken);
  const [showFilters, setShowFilters] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  const [openFormModal, setOpenFormModal] = React.useState(false);
  const [formModalResult, setFormModalResult] = React.useState(null);
  const [openDanger, setOpenDanger] = React.useState(false);
  return (
    <Section className="bg-stone-100 rounded-lg p-6 md:p-8">
      <Div bordered padding="lg" className="space-y-6">
        <H1>Component demo</H1>
        <P>
          P element
        </P>

        <H2>Buttons</H2>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button size="md" variant="empty-blue">Small</Button>
        </div>
  <P className="text-xs text-foreground/60">Tip: Button suportă size, variant și className pentru overrides.</P>

        <H2>Link</H2>
        <ALink href="/" underline>
          Link de exemplu
        </ALink>
  <P className="text-xs text-foreground/60">Tip: Folosește Next.js Link în spate pentru navigare internă.</P>

        <H2>Social buttons & Report</H2>
        <div className="flex flex-wrap items-center gap-2">
          <SocialButton provider="google" text="Continuă cu Google" />
          <SocialButton provider="github" size="sm" variant="ghost" />
          <SocialButton provider="twitter" />
          <ReportButton className="ml-2" />
        </div>
        <P className="text-xs text-foreground/60">Tip: SocialButton suportă provider, size și variant. ReportButton are variantă link minimalistă.</P>

        <H2>List</H2>
        <Ul marker="decimal">
          <Li>Primul element</Li>
          <Li>Al doilea element</Li>
        </Ul>
  <P className="text-xs text-foreground/60">Tip: Ul/Li acceptă marker (disc, decimal, etc.).</P>

        <H2>Form</H2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@site.com" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="message">Mesaj</Label>
            <Textarea id="message" rows={5} placeholder="Scrie-ne..." />
          </div>
        </div>
  <P className="text-xs text-foreground/60">Tip: Input/Textarea sunt forwardRef și acceptă size, error, className.</P>

        <H2>Card</H2>
        <Card>
          <CardHeader>
            <CardTitle className={"text-blue-500"}>Titlu card</CardTitle>
            <CardDescription>Descriere scurtă</CardDescription>
          </CardHeader>
          <CardContent>
            <P>
              Conținut de card. Poți combina orice componente aici pentru a construi
              UI-uri coerente.
            </P>
          </CardContent>
          <CardFooter>
            <Button size="sm">Action</Button>
            <Button size="sm" variant="secondary">
              Cancel
            </Button>
          </CardFooter>
        </Card>
  <P className="text-xs text-foreground/60">Tip: Card expune sub-componente: Header, Title, Description, Content, Footer.</P>

        <H2>Card în Card + Tasks</H2>
        <CardInCard
          resource={{ name: "Resursă demo", description: "Exemplu card cu listă de task-uri în interior." }}
          tasks={cardTasks}
          taskTitle={newTaskTitle}
          onTaskTitleChange={setNewTaskTitle}
          onToggleTask={toggleTask}
          onAskDeleteResource={(res) => alert(`Delete resource: ${res.name}`)}
          onAskDeleteResourceItem={(task) => setCardTasks((prev) => prev.filter((t) => t.id !== task.id))}
          onAddResourceItem={addTask}
        />
        <P className="text-xs text-foreground/60">Tip: Un container util pentru gestionarea sub-itemilor (task-uri) pentru o resursă.</P>

        <H2 className={"mt-10 pb-2 border-b border-foreground/10 text-blue-900 underline underline-offset-8 decoration-2"}>
          Un H2 personalizat (exemplu)
        </H2>
        <P className="text-foreground/70">
          Am adăugat culori, underline, un border inferior și un spacing diferit doar prin
          <code className="mx-1">className</code>. Clasele adăugate aici vor avea prioritate față de
          cele implicite când se suprapun.
        </P>

        <H3>
          Note <Span muted>(tip)</Span>
        </H3>
        <P className="mt-2">
          Toate componentele acceptă className pentru a suprascrie stilurile
          implicite. De exemplu, <code>Button</code> poate primi
          <code className="mx-1">className=&quot;w-full&quot;</code>.
        </P>

        <H2>LoadingSpinner</H2>
        <div className="flex items-center gap-4">
          <LoadingSpinner />
          <LoadingSpinner className="h-6 w-6" />
          <LoadingSpinner className="h-10 w-10 text-blue-600" />
        </div>
  <P className="text-xs text-foreground/60">Tip: Spinner acceptă className (dimensiune/culoare) sau prop size numeric.</P>

        <H2>Dropdown</H2>
        <Dropdown>
          <DropdownTrigger className="bg-blue-900 text-white hover:bg-blue-800" leadingIcon={LocalUserIcon}>Trigger</DropdownTrigger>
          <DropdownContent>
            <DropdownItem href="/profile">Profile</DropdownItem>
            <DropdownSeparator />
            <DropdownItem as="button" type="button" onClick={() => alert("Clicked")}>Action</DropdownItem>
          </DropdownContent>
        </Dropdown>
        <P className="text-xs text-foreground/60">Tip: DropdownTrigger acceptă leadingIcon; DropdownItem folosește href pentru link sau <code>as=&quot;button&quot;</code> pentru acțiuni.</P>

        <H2>Language Switcher</H2>
        <Div className="bg-stone-100 p-3 rounded-md border border-gray-200 inline-flex">
          <LanguageSwitcher />
        </Div>

        <H2>ErrorDiv</H2>
        <ErrorDiv className="max-w-xl">
          <P>Eroare demonstrativă — acest mesaj poate fi închis.</P>
        </ErrorDiv>

        <H2>SubNavSearchBar + FilterSidebar (Advanced)</H2>
        <P>Bară opțională ce poate declanșa un Sidebar de filtre cu butonul „Advanced”.</P>
        <div>
          <SubNavSearchBar
            defaultValue=""
            onSubmit={(q) => alert(`Search: ${q}`)}
            rightSlot={
              <Button
                variant="empty-blue"
                type="button"
                onClick={() => setShowFilters((s) => !s)}
              >
                {showFilters ? t('common.hide') : t('common.advanced')}
              </Button>
            }
          />
          <div className="mt-4 flex gap-6">
            {showFilters ? (
              <FilterSidebar
                sticky
                filters={[
                  { key: "role", label: "Role", type: "select", options: [
                    { value: "", label: t('common.all') },
                    { value: "client", label: t('auth.client') },
                    { value: "vendor", label: t('auth.vendor') },
                  ]},
                  { key: "status", label: "Status", type: "radio", options: [
                    { value: "", label: t('common.any') },
                    { value: "active", label: t('common.active') },
                    { value: "inactive", label: t('common.inactive') },
                  ]},
                  { key: "tags", label: "Tags", type: "checkbox", options: [
                    { value: "vip", label: "VIP" },
                    { value: "trial", label: "Trial" },
                    { value: "beta", label: "Beta" },
                  ]},
                ]}
                onApply={({ query, values }) => alert(`Apply filters: q=${JSON.stringify(query)} values=${JSON.stringify(values)}`)}
                onClear={() => alert("Cleared")}
              />
            ) : null}
            <Div className="flex-1">
              <Card>
                <CardHeader>
                  <CardTitle>Listă exemplu</CardTitle>
                  <CardDescription>Conținutul ar sta în dreapta sidebar-ului.</CardDescription>
                </CardHeader>
                <CardContent>
                  <P className="text-sm text-gray-700">Aici poți randa tabelul sau gridul de rezultate.</P>
                </CardContent>
              </Card>
            </Div>
          </div>
          <P className="mt-2 text-xs text-foreground/60">Tip: Plasează SubNav imediat sub NavBar. Setează sticky atât pentru SubNav, cât și pentru Sidebar pentru aliniere.</P>
        </div>

        <H2>FilterUpBar</H2>
        <FilterUpBar
          defaultQuery=""
          defaultValues={{ sort: "createdAt:DESC" }}
          filters={[
            { key: "sort", label: "Sortare", type: "select", options: [
              { value: "createdAt:DESC", label: "Cele mai noi" },
              { value: "createdAt:ASC", label: "Cele mai vechi" },
            ]},
            { key: "min", label: "Preț minim", type: "number", placeholder: "0", step: "0.01" },
            { key: "max", label: "Preț maxim", type: "number", placeholder: "100" , step: "0.01"},
          ]}
          onApply={({ query, values }) => alert(`Apply top filters: q=${JSON.stringify(query)} values=${JSON.stringify(values)}`)}
          onClear={() => alert("Cleared top filters")}
        />

        <H2>DataTable</H2>
        <P>Tabel simplu cu search și filtrare pe client.</P>
        <DataTable className="bg-stone-100 p-4 rounded-md"
          columns={[
            { key: "name", header: "Name" },
            { key: "email", header: "Email" },
            { key: "role", header: "Role" },
          ]}
          rows={[
            { name: "Ana", email: "ana@example.com", role: "client" },
            { name: "Dan", email: "dan@example.com", role: "vendor" },
            { name: "Mara", email: "mara@example.com", role: "client" },
          ]}
          searchableKeys={["name", "email"]}
          filters={[{ key: "role", label: "Role", options: [
            { value: "client", label: t('auth.client') },
            { value: "vendor", label: t('auth.vendor') },
          ]}]}
          onRowClick={(row) => alert(`Row: ${row.name}`)}
        />
  <P className="text-xs text-foreground/60">Tip: Pentru date mari/paginare, extinde cu callbacks (<code>onQueryChange</code>, <code>onFiltersChange</code>) și fetch server-side.</P>

        <H2>Pagination</H2>
        <H2>Radio</H2>
        <Div className="flex items-center gap-4">
          <Radio name="demo" value="a" checked={authType === "login"} onChange={() => setAuthType("login")} label="Login" />
          <Radio name="demo" value="b" checked={authType === "register"} onChange={() => setAuthType("register")} label="Register" />
        </Div>
        <P className="text-xs text-foreground/60">Tip: Radio e un input simplu cu etichetă; folosește-l în formulare rapide.</P>

        <H2>Table — Vertical Expandable</H2>
        <Div className="space-y-3">
          <TableVerticalExpandable
            data={[
              { id: 1, name: "Produs A", price: 20, description: "Descriere lungă pentru produsul A" },
              { id: 2, name: "Produs B", price: 10, description: "Text descriptiv mai scurt" },
            ]}
            columns={[
              { key: "name", label: "Nume" },
              { key: "price", label: "Preț" },
              { key: "description", label: "Descriere" },
            ]}
            defaultVisibleKeys={["name", "price"]}
            actions={[{ title: "Edit", className: "bg-blue-100", icon: <span className="text-blue-700">✎</span>, onClick: (row) => alert(`Edit ${row.name}`) }]}
          />
          <VerticalExpandableTableWithHeader
            title="Produse"
            addLabel="Adaugă"
            onAdd={() => alert("Add click")}
            data={[
              { id: "p1", name: "Telefon X", price: 1999, stock: true, description: "Model nou, performant, autonomie ridicată." },
              { id: "p2", name: "Laptop Y", price: 3999, stock: false, description: "Ecran 15\", i7, 16GB RAM, SSD rapid." },
            ]}
            columns={[
              { key: "name", label: "Nume" },
              { key: "price", label: "Preț" },
              { key: "stock", label: "În stoc" },
              { key: "description", label: "Descriere" },
            ]}
            defaultVisibleKeys={["name", "price", "stock"]}
          />
        </Div>

        <H2>AuthForm</H2>
        <Div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>AuthForm ({authType})</CardTitle>
              <CardDescription>Formular demonstrativ pentru autentificare/înregistrare.</CardDescription>
            </CardHeader>
            <CardContent>
              <AuthForm type={authType} loading={authLoading} error={authError} onSubmit={handleAuthSubmit} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Container</CardTitle>
              <CardDescription>Wrapper cu max-width și padding lateral.</CardDescription>
            </CardHeader>
            <CardContent>
              <Div className="bg-stone-100 border border-gray-200 rounded p-2">
                <Container>
                  <Div className="bg-white border border-gray-200 rounded p-3 text-black">Conținut în Container</Div>
                </Container>
              </Div>
            </CardContent>
          </Card>
        </Div>

        <H2 className="mt-6">GeneralForm — Examples</H2>
        <P className="text-sm">Two examples below show how to use the configurable <code>GeneralForm</code> component: one simple onSubmit usage, and one with multiple fields and validations.</P>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Example 1 — Inline onSubmit</CardTitle>
              <CardDescription>Pass an array of fields and an <code>onSubmit</code> handler that returns a {`{ success, message }`} shape.</CardDescription>
            </CardHeader>
            <CardContent>
              <GeneralForm
                header="This form uses an inline onSubmit handler. Required fields show validation messages below each input."
                submitLabel="Save"
                onSubmit={example1Submit}
                cols={1}
                fields={[
                  { name: "name", label: "Name", type: "text", required: true, validate: { minLength: 2 } },
                  { name: "email", label: "Email", type: "email", required: true, validate: { pattern: /^[^@\s]+@[^@\s]+\.[^@\s]+$/ } },
                  { name: "age", label: "Age", type: "number", required: false, validate: { min: 0 } },
                  { name: "bio", label: "Bio", type: "textarea", rows: 3 },
                  { name: "images", label: "Images", type: "file", multiple: true, help: "Upload one or more images (optional)" },
                ]}
                onSuccess={(resp) => alert(`Example1 success: ${resp.message}`)}
                onError={(err) => alert(`Example1 error: ${err?.message || JSON.stringify(err)}`)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Example 2 — Multiple field types & validations</CardTitle>
              <CardDescription>Shows select, radio, checkbox and custom validation logic via the <code>validate.custom</code> function.</CardDescription>
            </CardHeader>
            <CardContent>
              <GeneralForm
                header="Demonstrates more field types. Server validation is simulated in the onSubmit handler (age &gt;= 18)."
                submitLabel="Create"
                onSubmit={example2Submit}
                fields={[
                  { name: "title", label: "Title", type: "text", required: true, validate: { minLength: 3 } },
                  { name: "price", label: "Price", type: "number", required: true, validate: { min: 0 } },
                  { name: "category", label: "Category", type: "select", options: [ { value: "", label: "Choose" }, { value: "a", label: "A" }, { value: "b", label: "B" } ], required: true },
                  { name: "age", label: "Minimum Age", type: "number", required: false, help: "Optional: server requires >=18" },
                  { name: "featured", label: "Featured", type: "checkbox", help: "Mark as featured" },
                ]}
                onSuccess={(resp) => alert(`Example2 success: ${resp.message}`)}
                onError={(err) => alert(`Example2 error: ${err?.message || JSON.stringify(err)}`)}
              />
            </CardContent>
          </Card>
        </div>

        <H2>GeneralScrollableFormModal</H2>
        <Div className="flex items-center gap-3">
          <Button variant="empty-blue" onClick={() => setOpenScrollableForm(true)}>Open scrollable form</Button>
          <Button variant="empty-blue" onClick={() => setOpenMultiMap(true)}>Open multi-pin map</Button>
        </Div>

        <H2>AccountSideBar</H2>
        <Div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 bg-stone-100 p-3 rounded-md border border-gray-200">
          <AccountSideBar />
          <Card>
            <CardHeader>
              <CardTitle>Tab Content</CardTitle>
              <CardDescription>Zona de conținut din dreapta.</CardDescription>
            </CardHeader>
            <CardContent>
              <P className="text-sm text-gray-700">Folosește AccountSideBar pentru meniul contului.</P>
            </CardContent>
          </Card>
        </Div>

        
        <Div className="bg-white border border-gray-200 rounded-md p-3 inline-block">
          <Pagination page={2} total={42} limit={10} onPageChange={(p) => alert(`go page ${p}`)} />
        </Div>

      </Div>
          <div className="p-6">
          <ProductCardWithCarousel
        images={[
          "/imgs/Screenshot from 2025-07-21 15-40-46.png",
          "/imgs/Screenshot from 2025-07-21 15-40-46.png",
          "/imgs/Screenshot from 2025-07-21 15-40-46.png",
          "/imgs/Screenshot from 2025-07-21 15-40-46.png",
          "/imgs/Screenshot from 2025-07-21 15-40-46.png",
        ]}
        title="Apple Watch Series 7 GPS, Aluminium Case, Starlight Sport"
        price={599}
        rating={5}
        onCta={() => console.log("add to cart")}
        href="#"
      />
    </div>


      <P>
        HorizontalCard
      </P>
     <div className="p-6">
      <HorizontalCard
        href="#"
        imageSrc="/imgs/Screenshot from 2025-07-21 15-40-46.png"
        imageAlt="Tech acquisitions"
        title="Noteworthy technology acquisitions 2021"
        description="Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order."
      />
    </div>

         <P>
        VerticalCard
      </P>
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <VerticalCard
        href="#"
        imageSrc="/imgs/Screenshot from 2025-07-21 15-40-46.png"
        imageAlt="Tech"
        title="Noteworthy technology acquisitions 2021"
        description="Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order."
        ctaLabel="Read more"
      />

      <VerticalCard
        href="#"
        imageSrc="/imgs/Screenshot from 2025-07-21 15-40-46.png"
        imageAlt="Tech"
        title="Noteworthy technology acquisitions 2021"
        description="Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order."
        ctaLabel="Read more"
      />
      </div>
    </div>

         <P>
        HorizontalCardTemplate
      </P>
    <div className="p-6">
      <HorizontalCardTemplate
        href="#"
        imageSrc="/imgs/Screenshot from 2025-07-21 15-40-46.png"
        imageAlt="Tech acquisitions"
        title="Noteworthy technology acquisitions 2021"
        description="Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order."
      />
    </div>

    <div className="p-6">
      <HorizontalAddCard onClick={() => alert('Add card clicked')} />
    </div>

    <div className="p-6">
      <Div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FeatureCard title="Livrare rapidă" description="Construiește și iterează rapid." icon={LocalUserIcon} />
        <FeatureCard title="Pixel-perfect" description="Detalii și consistență vizuală." icon={LocalUserIcon} />
        <FeatureCard title="Implicit sigur" description="Tipare solide pentru UX și securitate." icon={LocalUserIcon} />
      </Div>
    </div>

    <div className="p-6">
      <P>VerticalAddCard</P>
      <Div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <VerticalAddCard onClick={() => alert('Add new item')} />
      </Div>
    </div>

    <div className="p-6">
      <P>GalleryCarousel</P>
      <GalleryCarousel
        images={[
          { src: "/imgs/Screenshot from 2025-07-21 15-40-46.png", alt: "img1" },
          { src: "/imgs/Screenshot from 2025-07-21 15-40-46.png", alt: "img2" },
        ]}
      />
    </div>

    <div className="p-6">
      <P>MapEmbed (OSM)</P>
      <MapEmbed provider="osm" centerLat={45.7489} centerLng={21.2087} zoom={14} label="Timișoara" />
    </div>

    <div className="p-6">
      <P>MultiPinMap (inline)</P>
      <MapMarkers markers={demoMarkers} heightClass="h-[300px]" onMarkerClick={(m) => alert(`Clicked: ${m.label}`)} />
    </div>

    <div className="p-6">
      <Button variant="empty-blue" onClick={() => setOpenModal(true)}>Open modal</Button>
      <Button className="ml-2" variant="empty-blue" onClick={() => setOpenFormModal(true)}>Open form modal</Button>
      <Button className="ml-2" variant="destructive" onClick={() => setOpenDanger(true)}>Open danger</Button>
      <GenericModal open={openModal} onClose={() => setOpenModal(false)} title="Exemplu modal">
        <P>Conținut modal simplu, în stil stone-100.</P>
        <Div className="mt-4 flex justify-end gap-2">
          <Button variant="empty-gray" onClick={() => setOpenModal(false)}>Close</Button>
          <Button variant="empty-blue" onClick={() => setOpenModal(false)}>Confirm</Button>
        </Div>
      </GenericModal>
      
      {/*Generic modal + form example*/}
      <GenericModal open={openFormModal} onClose={() => setOpenFormModal(false)} title="Form in modal">
        <P className="mb-2">This modal contains a <code>GeneralForm</code>. Try uploading images to see previews.</P>
        <GeneralForm
          submitLabel="Save"
          cols={1}
          showReset={false}
          onSubmit={async (payload) => {
            // simulate server work and accept FormData
            await new Promise((r) => setTimeout(r, 600));
            let imagesCount = 0;
            if (typeof FormData !== 'undefined' && payload instanceof FormData) {
              const imgs = payload.getAll('images');
              imagesCount = imgs ? imgs.length : 0;
            } else {
              imagesCount = Array.isArray(payload.images) ? payload.images.length : 0;
            }
            return { success: true, message: `Saved (images: ${imagesCount})` };
          }}

          onSuccess={(resp) => {
            setFormModalResult(resp?.message ?? 'Saved');
            setOpenFormModal(false);
            // small visual cue
            setTimeout(() => alert(`Modal form saved: ${resp?.message ?? ''}`), 10);
          }}
          showClose={true}
          onClose={() => setOpenFormModal(false)}
          fields={[
            { name: 'title', label: 'Title', type: 'text', required: true },
            { name: 'images', label: 'Images', type: 'file', multiple: true, help: 'Optional images' },
          ]}
        />
      </GenericModal>
      <DangerModal
        open={openDanger}
        onClose={() => setOpenDanger(false)}
        title="Confirmare"
        message="Ești sigur că vrei să continui?"
        confirmText="Confirmă"
        cancelText="Anulează"
        onConfirm={() => setOpenDanger(false)}
      />
    </div>

    {/* Scrollable form modal demo */}
    <GeneralScrollableFormModal
      open={openScrollableForm}
      onClose={() => setOpenScrollableForm(false)}
      title="Scrollable form"
      submitLabel="Save"
      cols={1}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
        { name: 'images', label: 'Images', type: 'file', multiple: true },
      ]}
      onSubmit={async (payload) => {
        await new Promise((r) => setTimeout(r, 500));
        return { success: true, message: 'Saved from scrollable form' };
      }}
      onSuccess={(resp) => {
        alert(resp.message);
        setOpenScrollableForm(false);
      }}
    />

    {/* Multi-pin map modal demo */}
    <ModalMultiPinMap
      open={openMultiMap}
      onClose={() => setOpenMultiMap(false)}
      title="Harta cu multiple pin-uri"
      markers={demoMarkers}
      onMarkerClick={(m) => alert(`Marker: ${m.label}`)}
    />

    <div className="p-6">
      <P>Comments</P>
      <CommentInput value={commentVal} setValue={setCommentVal} onSubmit={addComment} />
      <CommentList comments={comments} t={t} currentUserId={2} onDelete={deleteComment} onEdit={editComment} />
    </div>

    <div className="p-6">
      <Footer />
    </div>

    {formModalResult ? (
      <Div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded">{formModalResult}</Div>
    ) : null}

    </Section>
  );
}
