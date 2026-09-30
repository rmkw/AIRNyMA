import { instanceStorage } from './instance-storage';
import { environment } from '../../environments/environment';

describe('instanceStorage', () => {
  const prefix = `siiernma:${environment.baseUrl}:`;

  it('uses the same instance prefix for writes, reads and removals', () => {
    const write = spyOn(localStorage, 'setItem');
    const read = spyOn(localStorage, 'getItem').and.returnValue('7');
    const remove = spyOn(localStorage, 'removeItem');
    instanceStorage.setItem('_id', '7');
    expect(write).toHaveBeenCalledWith(prefix + '_id', '7');
    expect(instanceStorage.getItem('_id')).toBe('7');
    expect(read).toHaveBeenCalledWith(prefix + '_id');
    instanceStorage.removeItem('_id');
    expect(remove).toHaveBeenCalledWith(prefix + '_id');
  });

  it('clears only its own keys and preserves other instances and legacy keys', () => {
    const originalKeys = Object.keys;
    spyOn(Object, 'keys').and.callFake(value => value === localStorage
      ? [prefix + '_id', prefix + 'fuenteEditable', 'siiernma:other:roles', 'roles']
      : originalKeys(value));
    const remove = spyOn(localStorage, 'removeItem');
    const clear = spyOn(localStorage, 'clear');
    instanceStorage.clear();
    expect(remove.calls.allArgs()).toEqual([[prefix + '_id'], [prefix + 'fuenteEditable']]);
    expect(clear).not.toHaveBeenCalled();
  });
});
