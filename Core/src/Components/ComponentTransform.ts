namespace Fudge {
    /**
     * Attaches a transform-[[Matrix4x4]] to the node, moving, scaling and rotating it in space relative to its parent.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class ComponentTransform extends Component {
        public local: Matrix4x4;

        public constructor(_matrix: Matrix4x4 = Matrix4x4.IDENTITY) {
            super();
            this.local = _matrix;
        }

        //#region Transfer
        public serialize(): Serialization {
            let serialization: Serialization = {   
                [super.type]: super.serialize()
            };
            return serialization;
        }
        public deserialize(_serialization: Serialization): Serializable {
            super.deserialize(_serialization[super.type]);
            return this;
        }

        public mutate(_mutator: Mutator): void {
            super.mutate(_mutator);
        }
        protected reduceMutator(_mutator: Mutator): void {
            delete _mutator.world;
            super.reduceMutator(_mutator);
        }
        //#endregion
    }
}
