import { EventBus, FSComponent, NumberFormatter, Subject, UnitType, VNode } from 'msfssdk';

import { NumberUnitDisplay } from '../../../../Shared/UI/Common/NumberUnitDisplay';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { ArrowToggle } from '../../../../Shared/UI/UIControls/ArrowToggle';
import { GroupBox } from '../GroupBox';
import { MFDUiPage, MFDUiPageProps } from '../MFDUiPage';
import { MFDSystemSetupAirspaceAlertsGroup } from './MFDSystemSetupAirspaceAlertsGroup';
import { MFDSystemSetupComSpacingGroup } from './MFDSystemSetupComSpacingGroup';
import { MFDSystemSetupDataBarGroup } from './MFDSystemSetupDataBarGroup';
import { MFDSystemSetupDateTimeGroup } from './MFDSystemSetupDateTimeGroup';
import { MFDSystemSetupNearestAirportGroup } from './MFDSystemSetupNearestAirportGroup';
import { MFDSystemSetupGenericRow } from './MFDSystemSetupRow';
import { MFDSystemSetupUnitsGroup } from './MFDSystemSetupUnitsGroup';

import './MFDSystemSetupPage.css';

/**
 * Component props for MFDSystemSetupPage.
 */
export interface MFDSystemSetupPageProps extends MFDUiPageProps {
  /** The event bus. */
  bus: EventBus;
}

/**
 * The MFD System Setup page.
 */
export class MFDSystemSetupPage extends MFDUiPage<MFDSystemSetupPageProps> {
  /** @inheritdoc */
  constructor(props: MFDSystemSetupPageProps) {
    super(props);

    this._title.set('Aux – System Setup 1');
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    // TODO: Move the close operations out of here into their respective views.
    switch (evt) {
      case FmsHEvent.UPPER_PUSH:
        this.toggleScroll();
        return true;
      case FmsHEvent.MENU:
      // TODO
    }

    return super.onInteractionEvent(evt);
  }

  /** @inheritdoc */
  protected onViewOpened(): void {
    super.onViewOpened();

    this.props.viewService.clearPageHistory();

    this.props.menuSystem.clear();
    this.props.menuSystem.pushMenu('systemsetup-root');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.viewContainerRef} class='mfd-page mfd-system-setup-page'>
        <div class='mfd-system-system-setup-subpage mfd-system-setup-subpage-1'>
          <div class='mfd-system-setup-column'>
            <MFDSystemSetupDateTimeGroup
              viewService={this.props.viewService}
              bus={this.props.bus}
              registerFunc={this.register}
              pageContainerRef={this.viewContainerRef}
            />
            <MFDSystemSetupUnitsGroup
              viewService={this.props.viewService}
              bus={this.props.bus}
              registerFunc={this.register}
              pageContainerRef={this.viewContainerRef}
            />
            <GroupBox title='BARO Transition Alert' class='mfd-system-setup-group'>
              <MFDSystemSetupGenericRow
                title='Altitude'
                left={
                  <ArrowToggle
                    options={['Off', 'On']}
                    class='force-white-color'
                  />
                }
                right={
                  <NumberUnitDisplay
                    value={Subject.create(UnitType.FOOT.createNumber(18000))}
                    displayUnit={Subject.create(null)}
                    formatter={NumberFormatter.create({ precision: 1 })}
                  />
                }
              />
              <MFDSystemSetupGenericRow
                title='Level'
                left={
                  <ArrowToggle
                    options={['Off', 'On']}
                    class='force-white-color'
                  />
                }
                right={<div>FL180</div>}
              />
            </GroupBox>
          </div>
          <div class='mfd-system-setup-column'>
            <MFDSystemSetupAirspaceAlertsGroup
              viewService={this.props.viewService}
              bus={this.props.bus}
              registerFunc={this.register}
              pageContainerRef={this.viewContainerRef}
            />
            <GroupBox title='Arrival Alert' class='mfd-system-setup-group'>
              <MFDSystemSetupGenericRow
                title='Distance'
                left={
                  <ArrowToggle
                    options={['Off', 'On']}
                    class='force-white-color'
                  />
                }
                right={
                  <NumberUnitDisplay
                    value={Subject.create(UnitType.NMILE.createNumber(1))}
                    displayUnit={Subject.create(null)}
                    formatter={NumberFormatter.create({ precision: 0.1, maxDigits: 3, forceDecimalZeroes: true })}
                  />
                }
              />
            </GroupBox>
            <GroupBox title='Flight Director' class='mfd-system-setup-group'>
              <MFDSystemSetupGenericRow
                title='Format Active'
                right={<div>Single Cue</div>}
              />
            </GroupBox>
          </div>
          <div class='mfd-system-setup-column'>
            <MFDSystemSetupDataBarGroup
              viewService={this.props.viewService}
              bus={this.props.bus}
              registerFunc={this.register}
              pageContainerRef={this.viewContainerRef}
            />
            <GroupBox title='GPS CDI' class='mfd-system-setup-group'>
              <MFDSystemSetupGenericRow
                title='Format Allowed'
                right={<div>Auto</div>}
              />
              <MFDSystemSetupGenericRow
                title='System CDI'
                right={
                  <NumberUnitDisplay
                    value={Subject.create(UnitType.NMILE.createNumber(2))}
                    displayUnit={Subject.create(null)}
                    formatter={NumberFormatter.create({ precision: 0.01, forceDecimalZeroes: true })}
                  />
                }
              />
            </GroupBox>
            <MFDSystemSetupComSpacingGroup
              viewService={this.props.viewService}
              bus={this.props.bus}
              registerFunc={this.register}
              pageContainerRef={this.viewContainerRef}
            />
            <MFDSystemSetupNearestAirportGroup
              viewService={this.props.viewService}
              bus={this.props.bus}
              registerFunc={this.register}
              pageContainerRef={this.viewContainerRef}
            />
          </div>
        </div>
      </div>
    );
  }
}