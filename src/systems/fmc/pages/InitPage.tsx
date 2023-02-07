import { FSComponent, DisplayComponent, VNode } from 'msfssdk';

export class InitPage extends DisplayComponent<any> {
  public render(): VNode {
    return (
      <div class='hello-world'>Hello World!</div>
    );
  }
}