import { EventBus, FlightPathCalculator, FSComponent, VNode } from 'msfssdk';

import { Fms } from 'garminsdk';

import { UiView, UiViewProps } from '../../../../../Shared/UI/UiView';
import { PFDSelectDeparture } from './PFDSelectDeparture';

/**
 * Component props for PFDSelectDepartureView.
 */
export interface PFDSelectDepartureViewProps extends UiViewProps {
  /** The event bus. */
  bus: EventBus;

  /** The flight management system. */
  fms: Fms;

  /** A flight path calculator to use to build preview flight plans. */
  calculator: FlightPathCalculator;
}

/**
 * A PFD view for selecting departures.
 */
export class PFDSelectDepartureView extends UiView<PFDSelectDepartureViewProps> {
  private readonly selectDepartureRef = FSComponent.createRef<PFDSelectDeparture>();

  /** @inheritdoc */
  protected onViewOpened(): void {
    super.onViewOpened();

    this.selectDepartureRef.instance.initializeIcaoInput();
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class='popout-dialog' ref={this.viewContainerRef}>
        <h1>{this.props.title}</h1>
        <PFDSelectDeparture
          ref={this.selectDepartureRef}
          onRegister={this.register}
          viewService={this.props.viewService}
          bus={this.props.bus}
          fms={this.props.fms}
          calculator={this.props.calculator}
        />
      </div>
    );
  }
}