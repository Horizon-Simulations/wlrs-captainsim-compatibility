import { FSComponent, DisplayComponent, VNode } from 'msfssdk';

export class PFD extends DisplayComponent<any> {
    public render(): VNode {
        return (
          <div class='my-component'>Hello World!</div>
        );
    }   
}