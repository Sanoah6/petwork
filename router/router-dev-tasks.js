const Router = require('express').Router;
const router = new Router();
require('dotenv').config();
const pool = require('../config/db');

router.get('/dev-tasks', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT 
                dt_id as id,
                dt_title as title,
                dt_description as description,
                dt_status as status,
                dt_position as position
            FROM dev_tasks 
            ORDER BY dt_status, dt_position ASC
        `);
        res.json([...rows]);
    } catch (err) {
        console.error('Ошибка получения задач:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/dev-tasks', async (req, res) => {
  try {
    const { title, description, status, position } = req.body;
    
    if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Название задачи обязательно' });
    }
    
    const { rows } = await pool.query(
      `INSERT INTO dev_tasks (dt_title, dt_description, dt_status, dt_position)
       VALUES ($1, $2, $3, $4)
       RETURNING 
           dt_id as id,
           dt_title as title,
           dt_description as description,
           dt_status as status,
           dt_position as position`,
      [title.trim(), description || '', status || 'start', position || 0]
    );

    res.status(201).json({ 
        message: 'Задача разработчика создана', 
        task: rows[0] 
    });
  } catch (err) {
    console.error('Ошибка создания задачи:', err);
    res.status(500).json({ error: err.message });
  }
});


router.patch('/dev-tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const { status, position, title, description } = req.body;
        
        let updateFields = [];
        let values = [];
        let paramIndex = 1;
        
        if (title !== undefined) {
            updateFields.push(`dt_title = $${paramIndex}`);
            values.push(title);
            paramIndex++;
        }
        
        if (description !== undefined) {
            updateFields.push(`dt_description = $${paramIndex}`);
            values.push(description);
            paramIndex++;
        }
        
        if (status !== undefined) {
            updateFields.push(`dt_status = $${paramIndex}`);
            values.push(status);
            paramIndex++;
        }
        
        if (position !== undefined) {
            updateFields.push(`dt_position = $${paramIndex}`);
            values.push(position);
            paramIndex++;
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'Нет полей для обновления' });
        }
        
        values.push(taskId);
        
        const query = `
            UPDATE dev_tasks 
            SET ${updateFields.join(', ')} 
            WHERE dt_id = $${paramIndex}
            RETURNING 
                dt_id as id,
                dt_title as title,
                dt_description as description,
                dt_status as status,
                dt_position as position
        `;
        
        const { rows } = await pool.query(query, values);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Задача не найдена' });
        }
        
        res.json({ 
            message: 'Задача разработчика обновлена', 
            task: rows[0] 
        });
        
    } catch (err) {
        console.error('Ошибка обновления задачи:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/dev-tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        
        const checkQuery = 'SELECT * FROM dev_tasks WHERE dt_id = $1';
        const checkResult = await pool.query(checkQuery, [taskId]);
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Задача не найдена' });
        }
        
        const deleteQuery = 'DELETE FROM dev_tasks WHERE dt_id = $1 RETURNING *';
        const { rows } = await pool.query(deleteQuery, [taskId]);
        
        res.json({ 
            message: `Задача разработчика с ID ${taskId} удалена`,
            deletedTask: rows[0]
        });
        
    } catch (err) {
        console.error('Ошибка удаления задачи:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/dev-tasks/reorder', async (req, res) => {
    try {
        const { columnName, taskIds } = req.body;
        
        if (!columnName || !Array.isArray(taskIds)) {
            return res.status(400).json({ 
                error: 'Необходимо указать columnName и массив taskIds' 
            });
        }
        
        const updatePromises = taskIds.map((taskId, index) => {
            return pool.query(
                'UPDATE dev_tasks SET dt_position = $1 WHERE dt_id = $2 AND dt_status = $3',
                [index, taskId, columnName]
            );
        });
        
        await Promise.all(updatePromises);
        
        res.json({ 
            message: `Порядок задач в колонке ${columnName} обновлен`,
            updatedCount: taskIds.length
        });
        
    } catch (err) {
        console.error('Ошибка изменения порядка задач:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;