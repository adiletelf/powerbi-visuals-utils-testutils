/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

// powerbi
import powerbi from "powerbi-visuals-api";
import IPromise = powerbi.IPromise;

// powerbi.visuals
import ISelectionId = powerbi.visuals.ISelectionId;
import IPoint = powerbi.extensibility.IPoint;

// powerbi.extensibility
import ISelectionManager = powerbi.extensibility.ISelectionManager;

export class MockISelectionManager implements ISelectionManager {
    private selectionIds: ISelectionId[] = [];

    private callback: (ids: ISelectionId[]) => void;

    // eslint-disable-next-line @typescript-eslint/ban-types
    public toggleExpandCollapse(selectionId: ISelectionId): IPromise<{}> {
        return new Promise<void>((resolve, reject) => {
            resolve();
        }) as any;
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    public showContextMenu(selectionId: ISelectionId, position: IPoint): IPromise<{}> {
        return new Promise<void>((resolve, reject) => {
            resolve();
        }) as any;
    }

    public select(selectionId: ISelectionId | ISelectionId[], multiSelect?: boolean): IPromise<ISelectionId[]> {
        const selectionIds: ISelectionId[] = Array.isArray(selectionId) ? selectionId : [selectionId];

        if (selectionIds.length < 1) {
            return new Promise((resolve, reject) => {
                resolve(this.selectionIds);
            }) as any;
        }

        if (selectionIds.length > 1) {
            // the new selection is a set of points
            if (multiSelect) {
                // if multiSelect is truthy, toggle the selection state of each selectionId
                selectionIds.forEach(id => {
                    const index = this.selectionIds.findIndex(selectedId => selectedId.equals(id));
                    if (index > -1) {
                        this.selectionIds.splice(index, 1);
                    } else {
                        this.selectionIds.push(id);
                    }
                });
            } else {
                // if an array of selectionIds are passed in, assume multiSelect and set the selection to be the new set that is selected
                this.selectionIds = selectionIds;
            }
        } else if (this.containsSelection(selectionIds[0])) {
            // the selectionId that was selected is a subset of what is already selected
            if (multiSelect) {
                // if multiSelect is on, deselect the selected id
                this.selectionIds = this.selectionIds.filter(x => !selectionIds[0].equals(x));
            } else {
                // if multiSelect is off, the selected item is the new selectedId, else deselect the selection
                this.selectionIds = selectionIds.length > 1 ? selectionIds : [];
            }
        } else {
            // the selectionId that was selected is not a subset of what is already selected
            if (multiSelect) {
                this.selectionIds.push(selectionIds[0]);
            } else {
                this.selectionIds = selectionIds;
            }
        }

        return new Promise((resolve, reject) => {
            resolve(this.selectionIds);
        }) as any;
    }

    public hasSelection(): boolean {
        return this.selectionIds.length > 0;
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    public clear(): IPromise<{}> {
        this.selectionIds = [];

        return new Promise<void>((resolve, reject) => {
            resolve();
        }) as any;
    }

    public getSelectionIds(): ISelectionId[] {
        return this.selectionIds;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public applySelectionFilter(): void { }

    public containsSelection(id: ISelectionId) {
        return this.selectionIds.some((selectionId: ISelectionId) => {
            return selectionId.equals(id);
        });
    }

    public registerOnSelectCallback(callback: (ids: ISelectionId[]) => void): void {
        this.callback = callback;
    }

    public simutateSelection(selections: ISelectionId[]): void {
        if (this.callback && typeof this.callback === "function") {
            this.callback(selections);
        }
    }
}
