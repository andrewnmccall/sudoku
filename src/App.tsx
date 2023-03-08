import { Component, For, Show, createEffect } from 'solid-js';
import { createStore, SetStoreFunction, Store } from "solid-js/store";

import styles from './App.module.css';

const arr3 = Array.from({ length: 3 }, (value, index) => index);

function createLocalStore<T extends object>(
  name: string,
  init: T
): [Store<T>, SetStoreFunction<T>] {
  // const localState = localStorage.getItem(name);
  const [state, setState] = createStore<T>(
    init
    // localState ? JSON.parse(localState) : init
  );
  createEffect(() => localStorage.setItem(name, JSON.stringify(state)));
  return [state, setState];
}
export function removeIndex<T>(array: readonly T[], index: number): T[] {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

interface Block  { id: number; aX: number; aY: number; bX: number; bY: number; value: string, valid: boolean, editable: boolean };
interface CheckStruct {
  [key: string]: number,
  '0': number,
  '1': number,
  '2': number,
  '3': number,
  '4': number,
  '5': number,
  '6': number,
  '7': number,
  '8': number,
  '9': number,
};
interface CheckGridStruct {rows: CheckStruct[], columns: CheckStruct[], squares: CheckStruct[] }

const presets = [
  "53 6   98 7 195          6 " +
  "8  4  7   6 8 3 2   3  1  6" +
  " 6          419 8 28   5 79"
]

const App: Component = () => {

  const idToCoor = (index: number) => {
    return {
      aX: Math.floor(index / (3 * 3 * 3)),
      aY: Math.floor((index / (3 * 3)) % (3)),
      bX: Math.floor((index % (3 * 3)) / 3),
      bY: Math.floor(index % (3)),
    };
  }

  const [blocks, setBlocks] = createLocalStore<Block[]>("blocks", Array.from({ length: 3 * 3 * 3 * 3}, (value, index) : Block => {
    let {aX, aY, bX, bY} = idToCoor(index);
    return {
      id: index,
      aX,
      aY,
      bX,
      bY,
      value: presets[0][index] == ' ' ? '' : presets[0][index],
      editable: presets[0][index] == ' ',
      valid: true
    };
  }));

  const validateBlocks = (blocks: Block[]) => {
    const checks: CheckGridStruct = {
      rows: [],
      columns: [],
      squares: [],
    };

    blocks.forEach((block, idx) => {
      if(!block.value) {
        setBlocks(idx, {
          valid: true
        });
        return;
      }

      let {aX, aY, bX, bY} = idToCoor(idx);
      let valid = true;
      const validSet = (val: CheckStruct) => {
        if(val[block.value] !== undefined) {
          setBlocks(idx, {
            valid: false
          });
          setBlocks(val[block.value], {
            valid: false
          });
          valid = false;
        } else {
          val[block.value] = idx;
        }
      }

      const squareIdx = (aX * 3) + aY;
      checks.squares[squareIdx] = checks.squares[squareIdx] ?? {};
      validSet(checks.squares[squareIdx]);
      
      const rowIdx = (aX * 3) + bX;
      checks.rows[rowIdx] = checks.rows[rowIdx] ?? {};
      validSet(checks.rows[rowIdx]);

      const columnIdx = (aY * 3) + bY;
      checks.columns[columnIdx] = checks.columns[columnIdx] ?? {};
      validSet(checks.columns[columnIdx]);

      if(valid) {
        setBlocks(idx, {
          valid: true
        });
      }
    });
    return blocks
  }
  const setBlockValue = (aX: number, aY: number, bX: number, bY: number, value: string) => {
    setBlocks(getBlockID(aX, aY, bX, bY),{
      id: (aX*3*3*3)+(aY*3*3)+(bX*3)+(bY),
      aX,
      aY,
      bX,
      bY,
      value,
      valid: true
    });
    validateBlocks(blocks);
  };

  const getBlock = (aX: number, aY: number, bX: number, bY: number) => {
    return blocks[(aX*3*3*3)+(aY*3*3)+(bX*3)+(bY)]
  };

  const getBlockValue = (aX: number, aY: number, bX: number, bY: number) => {
    return blocks[(aX*3*3*3)+(aY*3*3)+(bX*3)+(bY)].value
  };

  const getBlockClass = (aX: number, aY: number, bX: number, bY: number) => {
    return blocks[(aX*3*3*3)+(aY*3*3)+(bX*3)+(bY)].valid ? '' : 'invalid';
  };

  const getBlockID = (aX: number, aY: number, bX: number, bY: number) => {
    return blocks[(aX*3*3*3)+(aY*3*3)+(bX*3)+(bY)].id;
  };

  const getBlockCoordinates = (aX: number, aY: number, bX: number, bY: number) => {
    const block =  blocks[(aX*3*3*3)+(aY*3*3)+(bX*3)+(bY)];
    return `${block.aX}-${block.aY}-${block.bX}-${block.bY}`;
  };


  return (
    <main class={styles.App}>
      <header class={styles.header}>
      </header>
      <table>
        <For each={arr3} fallback={<div>Loading...</div>}>
          {(aX) => (
            <tr>
              <For each={arr3} fallback={<div>Loading...</div>}>
                {(aY) => (
                  <td>
                    <table>
                      <For each={arr3} fallback={<div>Loading...</div>}>
                        {(bX) => (
                          <tr>
                            <For each={arr3} fallback={<div>Loading...</div>}>
                              {(bY) => (
                                <td
                                  data-pos={getBlockID(aX, aY, bX, bY)}
                                  data-coor={`${aX}-${aY}-${bX}-${bY}`}
                                  data-block={getBlockCoordinates(aX, aY, bX, bY)}
                                  class={getBlockClass(aX, aY, bX, bY) + ' block'}>
                                  <Show when={!getBlock(aX, aY, bX, bY).editable} >
                                    {getBlockValue(aX, aY, bX, bY)}
                                  </Show>
                                  <Show when={getBlock(aX, aY, bX, bY).editable} >
                                    <input
                                      type="number"
                                      value={getBlockValue(aX, aY, bX, bY)}
                                      min="1"
                                      max="9"
                                      onChange={(e) => setBlockValue(aX, aY, bX, bY, e.currentTarget.value)} />
                                  </Show>
                                </td>
                              )}
                            </For>
                          </tr>
                        )}
                      </For>
                    </table>
                  </td>
                )}
              </For>
            </tr>
          )}
        </For>
      </table>
    </main>
  );
};

export default App;
