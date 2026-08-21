/**
 * Edison / Obsidian Foundry: this shell intentionally stays dark and quiet so
 * the story, molten visuals, and high-contrast editorial type remain primary.
 */
import Home from "./pages/Home";
import Signals from "./pages/Signals";
import { PrivacyPolicy, TermsOfService } from "./pages/Legal";
import Waitlist from "./pages/Waitlist";
import { Route, Switch } from "wouter";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/waitlist" component={Waitlist} />
      <Route path="/signals" component={Signals} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route component={Home} />
    </Switch>
  );
}
