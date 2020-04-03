///<reference path="TreeList.ts"/>
namespace FudgeUserInterface {
  export enum TREE_CLASS {
    SELECTED = "selected",
    INACTIVE = "inactive"
  }

  export enum EVENT_TREE {
    RENAME = "rename",
    OPEN = "open",
    FOCUS_NEXT = "focusNext",
    FOCUS_PREVIOUS = "focusPrevious",
    FOCUS_IN = "focusin",
    FOCUS_OUT = "focusout",
    DELETE = "delete",
    CHANGE = "change",
    DOUBLE_CLICK = "dblclick",
    KEY_DOWN = "keydown",
    DRAG_START = "dragstart",
    DRAG_OVER = "dragover",
    DROP = "drop",
    POINTER_UP = "pointerup",
    SELECT = "itemselect",
    UPDATE = "update",
    ESCAPE = "escape",
    COPY = "copy",
    CUT = "cut",
    PASTE = "paste"
  }

  /**
   * Extension of [[TreeList]] that represents the root of a tree control  
   * ```plaintext
   * tree <ul>
   * ├ treeItem <li>
   * ├ treeItem <li>
   * │ └ treeList <ul>
   * │   ├ treeItem <li>
   * │   └ treeItem <li>
   * └ treeItem <li>
   * ```
   */
  export class Tree<T> extends TreeList<T> {
    public broker: TreeBroker<T>;

    constructor(_broker: TreeBroker<T>, _root: T) {
      super([]);
      this.broker = _broker;
      let root: TreeItem<T> = new TreeItem<T>(this.broker, _root);
      this.appendChild(root);

      this.addEventListener(EVENT_TREE.OPEN, this.hndOpen);
      this.addEventListener(EVENT_TREE.RENAME, this.hndRename);
      this.addEventListener(EVENT_TREE.SELECT, this.hndSelect);
      this.addEventListener(EVENT_TREE.DROP, this.hndDrop);
      this.addEventListener(EVENT_TREE.DELETE, this.hndDelete);
      this.addEventListener(EVENT_TREE.ESCAPE, this.hndEscape);
      this.addEventListener(EVENT_TREE.COPY, this.hndCopyPaste);
      this.addEventListener(EVENT_TREE.PASTE, this.hndCopyPaste);
      this.addEventListener(EVENT_TREE.CUT, this.hndCopyPaste);
    }

    /**
     * Clear the current selection
     */
    public clearSelection(): void {
      this.broker.selection.splice(0);
      this.displaySelection(<T[]>this.broker.selection);
    }

    private hndOpen(_event: Event): void {
      let item: TreeItem<T> = <TreeItem<T>>_event.target;
      let children: T[] = this.broker.getChildren(item.data);
      if (!children || children.length == 0)
        return;

      let branch: TreeList<T> = this.createBranch(children);
      item.setBranch(branch);
      this.displaySelection(<T[]>this.broker.selection);
    }

    private createBranch(_data: T[]): TreeList<T> {
      let branch: TreeList<T> = new TreeList<T>([]);
      for (let child of _data) {
        branch.addItems([new TreeItem(this.broker, child)]);
      }
      return branch;
    }

    private hndRename(_event: Event): void {
      let item: TreeItem<T> = <TreeItem<T>>(<HTMLInputElement>_event.target).parentNode;
      let renamed: boolean = this.broker.rename(item.data, item.getLabel());
      if (renamed)
        item.setLabel(this.broker.getLabel(item.data));
    }

    // Callback / Eventhandler in Tree
    private hndSelect(_event: Event): void {
      _event.stopPropagation();
      let detail: { data: Object, interval: boolean, additive: boolean } = (<CustomEvent>_event).detail;
      let index: number = this.broker.selection.indexOf(<T>detail.data);

      if (detail.interval) {
        let dataStart: T = <T>this.broker.selection[0];
        let dataEnd: T = <T>detail.data;
        this.clearSelection();
        this.selectInterval(dataStart, dataEnd);
        return;
      }

      if (index >= 0 && detail.additive)
        this.broker.selection.splice(index, 1);
      else {
        if (!detail.additive)
          this.clearSelection();
        this.broker.selection.push(<T>detail.data);
      }

      this.displaySelection(<T[]>this.broker.selection);
    }

    private hndDrop(_event: DragEvent): void {
      _event.stopPropagation();
      this.addChildren(this.broker.dragDrop.sources, this.broker.dragDrop.target);
    }

    private addChildren(_children: T[], _target: T): void {
      // if drop target included in children -> refuse
      if (_children.indexOf(_target) > -1)
        return;

      // add only the objects the addChildren-method of the broker returns
      let move: T[] = this.broker.addChildren(<T[]>_children, <T>_target);
      if (!move || move.length == 0)
        return;

      // TODO: don't, when copying or coming from another source
      this.delete(move);

      let targetData: T = <T>_target;
      let targetItem: TreeItem<T> = this.findOpen(targetData);

      let branch: TreeList<T> = this.createBranch(this.broker.getChildren(targetData));
      let old: TreeList<T> = targetItem.getBranch();
      targetItem.hasChildren = true;
      if (old)
        old.restructure(branch);
      else
        targetItem.open(true);

      _children = [];
      _target = null;
    }

    private hndDelete = (_event: Event): void => {
      let target: TreeItem<T> = <TreeItem<T>>_event.target;
      _event.stopPropagation();
      let remove: T[] = this.broker.delete(target.data);
      
      this.delete(remove);
    }
    
    private hndEscape = (_event: Event): void => {
      this.clearSelection();
    }
    
    private hndCopyPaste = (_event: Event): void => {
      console.log(_event);
      _event.stopPropagation();
      let target: TreeItem<T> = <TreeItem<T>>_event.target;
      switch (_event.type) {
        case EVENT_TREE.COPY:
          this.broker.copyPaste.sources = this.broker.copy([...this.broker.selection]);
          break;
        case EVENT_TREE.PASTE:
          this.addChildren(this.broker.copyPaste.sources, target.data);
          break;
        case EVENT_TREE.CUT:
          break;
      }
    }
  }

  customElements.define("ul-tree", <CustomElementConstructor><unknown>Tree, { extends: "ul" });
}