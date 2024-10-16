import { EventBus, FocusPosition, FSComponent, VNode } from 'msfssdk';

import { Fms } from 'garminsdk';

import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { UiView, UiViewProps } from '../../../../Shared/UI/UiView';
import { FPLDetails } from './FPLDetails';

import './FPL.css';

/** The properties on the flight plan popout component. */
interface FPLPopupProps extends UiViewProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** An FMS state manager. */
  fms: Fms;
}

/**
 * The FPL popup container encapsulates the actual popup logic.
 */
export class FPL extends UiView<FPLPopupProps> {
  private readonly fplDetailsRef = FSComponent.createRef<FPLDetails>();

  /** @inheritdoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.UPPER_PUSH:
        if (!this.fplDetailsRef.instance.isFocused) {
          this.fplDetailsRef.instance.focus(FocusPosition.MostRecent);
          this.fplDetailsRef.instance.scrollToActiveLeg(true);
        } else {
          this.fplDetailsRef.instance.blur();
          this.fplDetailsRef.instance.scrollToActiveLeg(false);
        }
        return true;
      case FmsHEvent.MENU:
        // Always pass menu events through to FPLDetails, even if scroll is disabled.
        if (!this.fplDetailsRef.instance.isFocused) {
          return this.fplDetailsRef.instance.openDetailsMenu();
        }
    }

    let handled = false;
    if (this.fplDetailsRef.instance.isFocused) {
      handled = this.fplDetailsRef.instance.onInteractionEvent(evt);
    }

    if (!handled) {
      return super.onInteractionEvent(evt);
    } else {
      return handled;
    }
  }

  /** Called when the view is resumed. */
  public onViewResumed(): void {
    if (this.fplDetailsRef.instance !== undefined) {
      this.fplDetailsRef.instance.fplViewResumed();
    }
  }

  /** Called when the view is closed. */
  public onViewClosed(): void {
    this.fplDetailsRef.instance.blur();
    this.setScrollEnabled(true);
  }

  /** Called when the view is opened. */
  public onViewOpened(): void {
    if (this.fplDetailsRef.instance !== undefined) {
      this.fplDetailsRef.instance.focus(FocusPosition.MostRecent);
      this.fplDetailsRef.instance.fplViewOpened(true);
    }
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class='popout-dialog' ref={this.viewContainerRef}>
        <h1>{this.props.title}</h1>
        <FPLDetails onRegister={this.register} ref={this.fplDetailsRef} bus={this.props.bus} viewService={this.props.viewService} fms={this.props.fms} />
      </div>
    );
  }
}