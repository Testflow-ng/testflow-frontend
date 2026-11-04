import { Component } from 'react';
import { Banner } from '../../components/ui/index.js';

/** A broken preview should show a message, not take the whole page down. */
class PreviewBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(prev) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (this.state.error) return <Banner variant="danger" title="This preview failed to render.">{String(this.state.error.message ?? this.state.error)}</Banner>;
    return this.props.children;
  }
}

export default PreviewBoundary;
