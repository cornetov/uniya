using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Uniya.CMS.Model;

namespace Uniya.CMS.Data
{
    /// <summary>The common data access.</summary>
    public class XData
    {
        // ------------------------------------------------------------------------------------
        #region ** object model



        #endregion

        // -------------------------------------------------------------------------------
        #region ** select

        /// <summary>
        /// Read one entity using identifier with all columns.
        /// </summary>
        /// <param name="pairs">The pair of column name and value.</param>
        /// <returns>The entity collection.</returns>
        public async Task<IReadOnlyList<T>> Read<T>(params KeyValuePair<string, object>[] pairs)
        {
            // empty initialization
            var collection = new XEntityCollection();

            // read selected
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                var cmd = connection.CreateCommand();
                cmd.CommandText = $"SELECT * FROM [dbo].[{entityName}]";
                var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    collection.Add(ReadEntity(entityName, reader));
                }
            }

            // done
            return collection;
        }

        /// <summary>
        /// Select data using query object.
        /// </summary>
        /// <param name="query">The query object.</param>
        /// <returns>The entity collection.</returns>
        public async Task<ISet> Select<T>(XQuery query)
        {
            // empty initialization
            var collection = new XEntityCollection();

            // read selected
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                var cmd = connection.CreateCommand();
                cmd.CommandText = query.ToSql();
                var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    collection.Add(Read(query.EntityName, reader));
                }
            }

            // done
            return collection;
        }

        private static XEntity Read(string entityName, IDataReader reader)
        {
            var entity = new XEntity(entityName);
            for (int i = 0; i < reader.FieldCount; i++)
            {
                entity.Items.Add(reader.GetName(i), reader.GetValue(i));
            }
            return entity;
        }

        #endregion

        //-----------------------------------------------------------------------------
        #region ** create

        /// <summary>
        /// Create entity object in database.
        /// </summary>
        /// <param name="entities">The collection of entity.</param>
        /// <returns>Without information.</returns>
        public async Task Create(params XEntity[] entities)
        {
            // sanity
            if (entities.Length == 0) return;

            // inserts
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                var cmd = connection.CreateCommand();
                var entityName = string.Empty;

                // TODO: INSERT BULK

                foreach (var entity in entities)
                {
                    // sanity
                    if (entity.State != XEntityState.Created) continue;

                    // create insert command and add parameters
                    if (CmdInsert(cmd, entity))
                    {
                        // execute
                        var id = await cmd.ExecuteScalarAsync();

                        // last settings
                        entity.EntityId = id.ToString();
                        entity.Actualization();
                    }
                }
            }
        }

        #endregion

        // -------------------------------------------------------------------------------
        #region ** update

        /// <summary>
        /// Update entity object in database.
        /// </summary>
        /// <param name="entities">The collection of entity.</param>
        /// <returns>Without information.</returns>
        public async Task Update(params XEntity[] entities)
        {
            // sanity
            if (entities.Length == 0) return;

            // updates
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                var cmd = connection.CreateCommand();
                var entityName = string.Empty;

                // TODO: UPDATE BULK

                foreach (var entity in entities)
                {
                    // sanity
                    if (entity.State != XEntityState.Created) continue;

                    // create update command and add parameters
                    if (CmdUpdate(cmd, entity))
                    {
                        // execute
                        await cmd.ExecuteScalarAsync();

                        // last settings
                        entity.Actualization();
                    }
                }
            }
        }

        #endregion

        // -------------------------------------------------------------------------------
        #region ** delete

        /// <summary>
        /// Delete entity object in database.
        /// </summary>
        /// <param name="entities">The collection of entity.</param>
        /// <returns>Without information.</returns>
        public async Task Delete(params XEntity[] entities)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                var cmd = connection.CreateCommand();
                var entityName = string.Empty;
                foreach (var entity in entities)
                {
                    if (CmdDelete(cmd, entity))
                        await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        /// <summary>
        /// Delete entity object in database.
        /// </summary>
        /// <param name="entityName">The entity name.</param>
        /// <param name="key">The primary key name.</param>
        /// <param name="ids">The collection of identifiers.</param>
        /// <returns>Without information.</returns>
        public async Task Delete(string entityName, string key, params object[] ids)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                var cmd = connection.CreateCommand();
                cmd.CommandText = GetDelete(entityName, key);
                foreach (var id in ids)
                {
                    cmd.Parameters.Clear();
                    cmd.Parameters.AddWithValue("@ID", id);
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        #endregion
    }
}
