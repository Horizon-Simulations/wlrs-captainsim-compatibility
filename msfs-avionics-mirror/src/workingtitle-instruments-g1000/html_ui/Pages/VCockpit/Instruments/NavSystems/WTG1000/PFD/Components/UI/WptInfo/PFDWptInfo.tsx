import { FSComponent, LatLonDisplay, VNode } from 'msfssdk';

import { WptInfo } from '../../../../Shared/UI/WptInfo/WptInfo';

import './PFDWptInfo.css';

/**
 * The PFD waypoint info popout.
 */
export class PFDWptInfo extends WptInfo {
  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='popout-dialog pfd-wptinfo' ref={this.viewContainerRef}>
        <h1>{this.props.title}</h1>
        {this.renderWaypointInput()}
        <hr />
        <div class='pfd-wptinfo-data'>
          <div class='pfd-wptinfo-data-field pfd-wptinfo-bearing'>
            <div class='pfd-wptinfo-data-field-title'>BRG</div>
            {this.renderBearing()}
          </div>
          <div class='pfd-wptinfo-data-field pfd-wptinfo-distance'>
            <div class='pfd-wptinfo-data-field-title'>DIS</div>
            {this.renderDistance()}
          </div>
          <div class='pfd-wptinfo-region'>{this.store.region}</div>
          <LatLonDisplay location={this.store.location} class='pfd-wptinfo-latlon' />
        </div>
        <div class='pfd-wptinfo-prompt'>{this.store.prompt}</div>
      </div>
    );
  }
}
