import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Code2,
  PenTool,
  Search,
  BarChart3,
  PencilRuler,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const disciplines = [
  {
    icon: Code2,
    title: "Development",
    description: "Websites, applications, and the systems behind them.",
  },
  {
    icon: PencilRuler,
    title: "Design & creative",
    description: "Distinct identities and thoughtful digital experiences.",
  },
  {
    icon: PenTool,
    title: "Writing & content",
    description: "The right words to bring a good idea into focus.",
  },
  {
    icon: BarChart3,
    title: "Business & marketing",
    description: "Fresh thinking to help your next project grow.",
  },
];

export default function LandingPage() {
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const home =
    user?.role === "CLIENT" ? "/client/dashboard" : "/freelancer/dashboard";
  function search(event) {
    event.preventDefault();
    navigate(
      user
        ? user.role === "CLIENT"
          ? "/client/jobs/new"
          : `/jobs?q=${encodeURIComponent(query)}`
        : `/login?next=${encodeURIComponent(`/jobs?q=${encodeURIComponent(query)}`)}`,
    );
  }
  return (
    <div className="public-page">
      <header className="public-nav">
        <Link to="/" className="wordmark">
          <span className="brand-symbol" />
          Dealancer
        </Link>
        <nav aria-label="Public navigation">
          <a className="nav-extra" href="#expertise">
            Explore expertise
          </a>
          <Link className={user ? "nav-extra" : ""} to={user ? home : "/login"}>
            {user ? "My workspace" : "Log in"}
          </Link>
          <Link
            className="button button-primary"
            to={user ? home : "/register"}
          >
            {user ? "Open workspace" : "Get started"}
            <ArrowUpRight size={16} />
          </Link>
        </nav>
      </header>
      <main>
        <section className="hero">
          <img
            src="/workspace.jpg"
            alt="A bright shared workspace with glass-walled meeting rooms"
            fetchPriority="high"
          />
          <div className="hero-content">
            <div className="hero-label">
              <span className="status-dot" />
              Independent talent. Shared ambition.
            </div>
            <h1>Dealancer</h1>
            <h2>
              Good work starts
              <br />
              with the right connection.
            </h2>
            <p>
              A place for people with ideas and people with the skills to bring
              them to life.
            </p>
            <form className="hero-search" onSubmit={search}>
              <Search size={20} aria-hidden="true" />
              <input
                aria-label="Search opportunities"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="What would you like to work on?"
              />
              <button className="button button-primary" type="submit">
                Explore
                <ArrowUpRight size={16} />
              </button>
            </form>
            <div className="hero-links">
              <Link
                to={user?.role === "CLIENT" ? "/client/jobs/new" : "/register"}
              >
                I'm hiring talent <span aria-hidden="true">&#8599;</span>
              </Link>
              <Link to={user?.role === "FREELANCER" ? "/jobs" : "/register"}>
                I'm looking for work <span aria-hidden="true">&#8599;</span>
              </Link>
            </div>
          </div>
        </section>
        <div className="expertise-band">
          <span>Make room for your next idea.</span>
          <strong>Development</strong>
          <strong>Design</strong>
          <strong>Content</strong>
          <strong>Marketing</strong>
          <strong>Business</strong>
        </div>
        <section className="public-section" id="expertise">
          <p className="eyebrow">A world of expertise</p>
          <h2>The skills your next chapter needs.</h2>
          <p>
            Start with a clear brief. Find a shared direction. Build something
            worthwhile.
          </p>
          <div className="discipline-grid">
            {disciplines.map(({ icon: Icon, title, description }) => (
              <div className="discipline" key={title}>
                <Icon size={25} />
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="public-cta">
          <div>
            <h2>Your next project starts here.</h2>
            <p>Connect through a brief, a proposal, and a shared plan.</p>
          </div>
          <Link
            className="button button-primary"
            to={user ? home : "/register"}
          >
            {user ? "Go to workspace" : "Join Dealancer"}
            <ArrowUpRight size={17} />
          </Link>
        </section>
      </main>
      <footer className="public-footer">
        <Link className="wordmark" to="/">
          Dealancer
        </Link>
        <span>Independent work. Meaningful connections.</span>
        <span>&copy; {new Date().getFullYear()} Dealancer</span>
      </footer>
    </div>
  );
}
