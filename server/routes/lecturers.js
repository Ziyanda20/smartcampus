router.get('/lecturers/:id/schedule', 
    authenticateUser, 
    async (req, res, next) => {
     
      if (req.user.role === 'admin') return next();
      
      if (req.user.role === 'lecturer' && req.user.id !== req.params.id) {
        return res.status(403).json({ error: 'Access Denied' });
      }
      next();
    },
    async (req, res) => {
      try {
        const { id } = req.params;
  
        const [schedule] = await db.query(`
          SELECT 
            c.id as class_id,
            c.name as class_name,
            r.name as room_name,
            r.building,
            d.name as day,
            s.start_time,
            s.end_time,
            DATE_FORMAT(s.start_time, '%H:%i') as formatted_start_time,
            DATE_FORMAT(s.end_time, '%H:%i') as formatted_end_time
          FROM classes c
          JOIN rooms r ON c.room_id = r.id
          JOIN schedules s ON c.schedule_id = s.id
          JOIN days d ON s.day_id = d.id
          JOIN lecturer_classes lc ON c.id = lc.class_id
          WHERE lc.lecturer_id = ?
          ORDER BY d.id, s.start_time
        `, [id]);
  
        res.json({ 
          success: true,
          data: schedule 
        });
      } catch (error) {
        console.error('Error fetching lecturer schedule:', error);
        res.status(500).json({ 
          success: false,
          error: 'Failed to fetch schedule',
          details: error.message 
        });
      }
    }
  );