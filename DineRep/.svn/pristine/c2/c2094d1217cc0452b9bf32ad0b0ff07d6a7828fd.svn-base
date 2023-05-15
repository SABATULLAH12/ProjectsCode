using System;
using System.Collections;
using System.Collections.Generic;

namespace Framework.Models.Table
{
    public class VCellCollection : ICollection<VCell>
    {
        protected ArrayList _innerArray;
        protected bool _isReadOnly;

        public VCellCollection()
        {
            this._innerArray = new ArrayList();
        }

        public virtual VCell this[int index]
        {
            get { return (VCell)this._innerArray[index]; }
            set { this._innerArray[index] = value; }
        }

        public void Add(VCell item)
        {
            this._innerArray.Add(item);
        }

        public void Clear()
        {
            this._innerArray.Clear();
        }

        public bool Contains(VCell item)
        {
            bool result = false;
            for (int i = 0; i < this.Count; i++)
            {
                var obj = (VCell)this._innerArray[i];
                if (obj.Text == item.Text)
                {
                    result = true;
                    break;
                }
            }
            return result;
        }

        public void CopyTo(VCell[] array, int arrayIndex)
        {
            throw new NotImplementedException();
        }

        public int Count
        {
            get { return this._innerArray.Count; }
        }

        public bool IsReadOnly
        {
            get { return this._isReadOnly; }
        }

        public bool Remove(VCell item)
        {
            bool result = false;
            for (int i = 0; i < this.Count; i++)
            {
                var obj = (VCell)this._innerArray[i];
                if (obj.Text == item.Text)
                {
                    this._innerArray.RemoveAt(i);
                    result = true;
                    break;
                }
            }
            return result;
        }

        public IEnumerator<VCell> GetEnumerator()
        {
            throw new NotImplementedException();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            throw new NotImplementedException();
        }
    }
}