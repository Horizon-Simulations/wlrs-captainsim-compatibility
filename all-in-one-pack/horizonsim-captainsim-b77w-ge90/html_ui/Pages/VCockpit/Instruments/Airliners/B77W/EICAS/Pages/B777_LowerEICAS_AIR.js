var B777_LowerEICAS_AIR;
(function (B777_LowerEICAS_AIR) {
    class Display extends Airliners.EICASTemplateElement {
        constructor() {
            super();
            this.isInitialised = false;

        }
        get templateID() { return "B777LowerEICASAirTemplate"; }
        connectedCallback() {
            super.connectedCallback();
            TemplateElement.call(this, this.init.bind(this));
        }
        init() {
        
            this.isInitialised = true;
        }

        update(_deltaTime) {
        }

    }

    B777_LowerEICAS_AIR.Display = Display;
})(B777_LowerEICAS_AIR || (B777_LowerEICAS_AIR = {}));
customElements.define("b777-lower-eicas-air", B777_LowerEICAS_AIR.Display);