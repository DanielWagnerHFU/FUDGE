var UI_Tree;
(function (UI_Tree) {
    var ƒ = FudgeCore;
    var ƒUi = FudgeUserInterface;
    class TreeBrokerNode extends ƒUi.TreeBroker {
        getLabel(_node) {
            return _node.name;
        }
        rename(_node, _new) {
            _node.name = _new;
            return true;
        }
        hasChildren(_node) {
            return _node.getChildren().length > 0;
        }
        getChildren(_node) {
            return _node.getChildren();
        }
        delete(_object) {
            // delete selection independend of focussed item
            let deleted = [];
            for (let node of this.selection)
                if (node.getParent()) {
                    node.getParent().removeChild(node);
                    deleted.push(node);
                }
            this.selection.splice(0);
            return deleted;
        }
        addChildren(_children, _target) {
            // disallow drop for sources being ancestor to target
            let move = [];
            for (let child of _children)
                if (!_target.isDescendantOf(child))
                    move.push(child);
            for (let node of move)
                _target.addChild(node);
            return move;
        }
        copy(_originals) {
            // try to create copies and return them for paste operation
            let copies = [];
            for (let original of _originals) {
                let serialization = ƒ.Serializer.serialize(original);
                let copy = ƒ.Serializer.deserialize(serialization);
                copies.push(copy);
            }
            return copies;
        }
    }
    UI_Tree.TreeBrokerNode = TreeBrokerNode;
})(UI_Tree || (UI_Tree = {}));
//# sourceMappingURL=TreeBrokerNode.js.map