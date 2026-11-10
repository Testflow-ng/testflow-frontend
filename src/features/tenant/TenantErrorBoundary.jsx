import { Component } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button, EmptyState } from '../../components/ui/index.js';

/** Catches a crash on a student page so it shows a way back instead of a blank white screen. */
export function TenantCrash() {
  return (
    <div className="mx-auto flex min-h-svh max-w-[30rem] items-center px-5">
      <EmptyState icon={TriangleAlert} title="Something went wrong" description="This page hit a problem. Your answers are saved. Reload to carry on."
        action={<Button onClick={() => window.location.assign('/')}>Reload</Button>} />
    </div>
  );
}

class TenantErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <TenantCrash /> : this.props.children; }
}

export default TenantErrorBoundary;
