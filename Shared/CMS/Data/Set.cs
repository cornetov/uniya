using System;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Collections.Generic;
using System.Threading.Tasks;
using Uniya.CMS.Model;

#if ID_GUID
using _Id = System.Guid;
#else
using _Id = System.Int64;
#endif

namespace Uniya.CMS.Data;

// ----------------------------------------------------------------------------------------
#region ** XSet collection interface

public interface ISetCollection
{
    /// <summary>Get table schema of this collection.</summary>
    ITableSchema Schema { get; }
    /// <summary>Gets created or modified entities.</summary>
    /// <param name="state">The entity state.</param>
    /// <returns>The created or modified list.</returns>
    ICollection<XEntity> GetEntities(XEntityState state);
    /// <summary>Gets deleted entities with clear deleted list.</summary>
    /// <returns>The deleted list.</returns>
    ICollection<XEntity> GetDeletedWithClear();
}

#endregion

/// <summary>
/// Proxy of database.
/// </summary>
public class XSetCollection<T> : ObservableCollection<T>, ISetCollection where T : class
{
    // ------------------------------------------------------------------------------------
    #region ** dynamic object model

    private Dictionary<_Id, int> _cache = [];
    private readonly List<T> _deleted = [];

    /// <summary>
    /// Gets object by identifier.
    /// </summary>
    /// <param name="id">The object identifier.</param>
    /// <returns>Really object if found, otherwise <b>null</b>.</returns>
    public T GetById(_Id id)
    {
        if (_cache.ContainsKey(id))
        {
            int idx = _cache[id];
            if (idx >= 0 && idx < Count)
                return this[idx];
        }
        XSet.Trace($"Not found a object for ID={id}", 'w');
        return default;
    }

    // ** support ISetCollection

    /// <summary>Get table schema of this collection.</summary>
    public ITableSchema Schema { get; private set; }

    /// <summary>
    /// Read some entities using parameters.
    /// </summary>
    /// <param name="data">The read-only database interface.</param>
    /// <param name="pairs">The pair of column name and value.</param>
    /// <returns>Without information.</returns>
    //public async Task Read(IReadonlyData data, params KeyValuePair<string, object>[] pairs)
    //{
    //    _cache.Clear();
    //    var entityName = typeof(T).Name.Substring(1);
    //    foreach (var table in XSet.Schema.Tables)
    //    {
    //        if (table.TableName.Equals(entityName))
    //        {
    //            foreach (var entity in await data.Read(entityName, pairs))
    //            {
    //                if (entity.Actualization(table))
    //                    Add(entity.To<T>());
    //            }
    //            break;
    //        }
    //    }
    //}
    /// <summary>Gets created or modified entities.</summary>
    /// <param name="state">The entity state.</param>
    /// <returns>The created or modified collection.</returns>
    public ICollection<XEntity> GetEntities(XEntityState state)
    {
        var collection = new Collection<XEntity>();
        if (state == XEntityState.Created)
        {
            var now = DateTime.Now;
            foreach (var item in this)
            {
                var db = item as IDB;
                db.Created = now;
                db.Modified = now;
                collection.Add(XEntity.From(item));
            }
        }
        return collection;
    }
    /// <summary>Gets deleted entities with clear deleted list.</summary>
    /// <returns>The deleted collection.</returns>
    public ICollection<XEntity> GetDeletedWithClear()
    {
        var collection = new Collection<XEntity>();
        foreach (var item in _deleted)
        {
            collection.Add(XEntity.From(item));
        }
        _deleted.Clear();
        return collection;
    }
    /// <summary>Actualization all changes.</summary>
    //public void Actualization()
    //{
    //    foreach (var item in this)
    //    {
    //        var proxy = item as XProxy;
    //        if (proxy != null)
    //            proxy.Entity.Actualization();
    //    }
    //    _deleted.Clear();
    //}

    #endregion

    // ------------------------------------------------------------------------------------
    #region ** override object model

    /// <summary>Removes all items from the collection.</summary>
    protected override void ClearItems()
    {
        foreach (var id in _cache.Keys)
        {
            int idx = _cache[id];
            if (idx >= 0 && idx < Count)
            {
                _deleted.Add(this[idx]);
            }
        }
        base.ClearItems();
        _cache.Clear();
    }
    /// <summary>Inserts an item into the collection at the specified index.</summary>
    /// <param name="index">The zero-based index at which item should be inserted.</param>
    /// <param name="item">The object to insert.</param>
    protected override void InsertItem(int index, T item)
    {
        var db = item as IDB;
        var id = db.Id;
        if (_cache.ContainsKey(id))
        {
            XSet.Trace($"Already exist in collection ID={id}", 'w');
            return;
        }
        base.InsertItem(index, item);
        _cache.Add(id, index);
    }
    /// <summary>Moves the item at the specified index to a new location in the collection.</summary>
    /// <param name="oldIndex">The zero-based index specifying the location of the item to be moved.</param>
    /// <param name="newIndex">The zero-based index specifying the new location of the item.</param>
    protected override void MoveItem(int oldIndex, int newIndex)
    {
        var db = this[oldIndex] as IDB;
        base.MoveItem(oldIndex, newIndex);
        _cache[db.Id] = newIndex;
    }

    /// <summary>Removes the item at the specified index of the collection.</summary>
    /// <param name="index">The zero-based index of the element to remove.</param>
    protected override void RemoveItem(int index)
    {
        var item = this[index];
        var db = item as IDB;
        _cache.Remove(db.Id);
        base.RemoveItem(index);
        _deleted.Add(item);
    }
    /// <summary>Replaces the element at the specified index.</summary>
    /// <param name="index">The zero-based index of the element to replace.</param>
    /// <param name="item">The new value for the element at the specified index.</param>
    protected override void SetItem(int index, T item)
    {
        var db = item as IDB;
        var id = db.Id;

        if (_cache.ContainsKey(id))
        {
            XSet.Trace($"Already exist in collection ID={id}", 'w');
            return;
        }
        _cache.Add(id, index);
        base.SetItem(index, item);
    }

    #endregion
}

/// <summary>
/// Proxy of database.
/// </summary>
public class XSet : IEntitySet
{
    // ------------------------------------------------------------------------------------
    #region ** general object model

    public static ISchema Schema = XConnector.GetSchema();

    public XSet()
    {
        // base
    }

    #endregion

    // ------------------------------------------------------------------------------------
    #region ** IEntitySet implementation

    /// <summary>Creating entities.</summary>
    public ICollection<XEntity> Creating
    {
        get { return GetEntities(XEntityState.Created); }
    }
    /// <summary>Updating entities.</summary>
    public ICollection<XEntity> Updating
    {
        get { return GetEntities(XEntityState.Modified); }
    }
    /// <summary>Deleting entities with clear deleted lists.</summary>
    public ICollection<XEntity> Deleting
    {
        get
        {
            var list = new Collection<XEntity>();
            for (int i = _list.Count; i > 0; i--)
            {
#pragma warning disable IDE0019
                ISetCollection collection = _list[i - 1] as ISetCollection;
#pragma warning restore IDE0019
                if (collection != null)
                {
                    foreach (var entity in collection.GetDeletedWithClear())
                        list.Add(entity);
                }
            }
            return list;
        }
    }
    ICollection<XEntity> GetEntities(XEntityState state)
    {
        var list = new Collection<XEntity>();
        for (int i = 0; i < _list.Count; i++)
        {
#pragma warning disable IDE0019
            ISetCollection collection = _list[i] as ISetCollection;
#pragma warning restore IDE0019
            if (collection != null)
            {
                foreach (var entity in collection.GetEntities(state))
                    list.Add(entity);
            }
        }
        return list;
    }
    #endregion

    // ------------------------------------------------------------------------------------
    #region ** dynamic object model

    /// <summary>
    /// Commit this set chenges.
    /// </summary>
    /// <param name="data">The transacted data.</param>
    public async Task Add<T>(T obj) where T : IDB
    {
        await data.Transaction(this);
    }

    //public async void Select(ICrudData data, params XQuery[] queries)
    //{
    //    foreach (var query in queries)
    //    {
    //        var collection = await data.Select(query);
    //        foreach (var entity in collection)
    //        {

    //        }
    //    }
    //}

    //public async Task Load(ICrudData data)
    //{
    //    for (int i = 0; i < _list.Count; i++)
    //    {
    //        var collection = _list[i] as ISetCollection;
    //        if (collection != null)
    //        {
    //            //data.Read()
    //            //var query = collection.GetQuery(null);
    //            //foreach (var entity in await data.Select(query))
    //            //{

    //            //}
    //            //data.Read()
    //            //collection.GetEntities
    //            //foreach (var entity in collection.GetEntities(state))
    //            //    list.Add(entity);
    //        }
    //    }
    //}

    /// <summary>
    /// Commit this set chenges.
    /// </summary>
    /// <param name="data">The transacted data.</param>
    public async Task CommitChanges(ITransactedData data)
    {
        await data.Transaction(this);
    }

    #endregion

    // ------------------------------------------------------------------------------------
    #region ** implement object model

    //private XProxy GetProxy(XEntity entity)
    //{
    //    switch (entity.EntityName)
    //    {
    //        case "User":
    //            //return new XProxy(entity);
    //            break;
    //    }
    //    return new XProxy(entity);
    //}

    private void OnCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
    {
        string oldText, newText;
        switch (e.Action)
        {
            case NotifyCollectionChangedAction.Add:
                newText = e.NewItems[0] != null ? e.NewItems[0].ToString() : "NULL";
                Trace($"Added new object: {newText}");
                break;
            case NotifyCollectionChangedAction.Remove:
                oldText = e.OldItems[0] != null ? e.OldItems[0].ToString() : "NULL";
                Trace($"Removed the object: {oldText}");
                break;
            case NotifyCollectionChangedAction.Replace:
                newText = e.NewItems[0] != null ? e.NewItems[0].ToString() : "NULL";
                oldText = e.OldItems[0] != null ? e.OldItems[0].ToString() : "NULL";
                Trace($"Object {oldText} replaced ob object {newText}");
                break;
        }
    }

    #endregion

    // ------------------------------------------------------------------------------------
    #region ** static object model

    /// <summary>
    /// Trace diagnostic information.
    /// </summary>
    /// <param name="message">The text message about issue.</param>
    public static void Trace(string message, char level = 'i')
    {
        var dt = DateTime.Now;
        Console.WriteLine($"{dt.ToShortDateString()} {dt.ToShortTimeString()} {level}: {message}");
    }
    /// <summary>
    /// Trace diagnostic information.
    /// </summary>
    /// <param name="condition"><b>true</b> to cause a message to be written; otherwise, <b>false</b>.</param>
    /// <param name="message">The text message about issue.</param>
    public static void TraceIf(bool condition, string message)
    {
        if (condition) Trace(message, '?');
    }
    /// <summary>
    /// Trace diagnostic information.
    /// </summary>
    /// <param name="condition"><b>true</b> to cause a message to be written; otherwise, <b>false</b>.</param>
    /// <param name="message">The text message about issue.</param>
    public static void TraceThrow(bool condition, string message)
    {
        if (condition)
        {
            Trace(message, 'X');
            throw new FormatException(message);
        }
    }

    #endregion
}