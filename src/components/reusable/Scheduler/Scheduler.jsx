import React, { useRef, useEffect, useCallback } from 'react';
import 'dhtmlx-scheduler';
import 'dhtmlx-scheduler/codebase/dhtmlxscheduler.css';
import { toast } from 'react-toastify';
import {
  saveEmployeeCalendarEvent,
  deleteEmployeeCalendarEventAPI,
} from '../../../helpers/employee-calendar/index.js';
import { TOAST_CONFIG } from '../../../constants/index.js';

const Scheduler = ({ events, onEventAdded, startDate, refreshCalendarOnFailure }) => {
    const schedulerContainer = useRef(null);
    const schedulerInstance = useRef(null);

  const postEmployeeCalendarEvent = useCallback(
    async (text, start_date, end_date, id = null, classname = 'purple') => {
        classname = classname || 'purple';
        schedulerInstance.current.loading = true;
        try {
        const { data, ok } = await saveEmployeeCalendarEvent({
          text,
          start_date,
          end_date,
          id,
          classname,
        });
            if (ok) {
                schedulerInstance.current.loading = false;
                if (data.success) {
                    toast.success(data.message,TOAST_CONFIG.SUCCESS);
                    onEventAdded(start_date);
                }
                if (data.success === false) {
                    refreshCalendarOnFailure();
                    toast.error(data.message,TOAST_CONFIG.ERROR);
                    return;
                }
            } else {
                console.log('error');
            }
        } catch (error) {
            console.log(error.message);
        } finally {
            schedulerInstance.current.loading = false;
        }
    },
    [],
  );

    const deleteEmployeeCalendarEvent = useCallback(async (id) => {
        schedulerInstance.current.loading = true;
        try {
            await deleteEmployeeCalendarEventAPI(id);
            schedulerInstance.current.loading = false;
            onEventAdded();
        } catch (error) {
            console.error(error.message);
        } finally {
            schedulerInstance.current.loading = false;
        }
    }, []);

    const initScheduler = useCallback(() => {
        const scheduler = schedulerInstance.current;
        const isMobile = window.innerWidth < 630;
        scheduler.skin = 'terrace';
    scheduler.config.header = ['day', 'week', 'month', 'date', 'prev', 'today', 'next'];
        scheduler.config.multi_day = true;
        scheduler.config.max_month_events = isMobile ? 5 : 5;
        scheduler.config.preserve_scroll = true;
        scheduler.config.responsive_lightbox = true;
        scheduler.config.agenda_end = 24;
        scheduler.config.scroll_hour = 24;
        scheduler.config.start_on_monday = false;
        scheduler.config.time_step = 15;
        scheduler.config.hour_height = 100;
        scheduler.config.hour_size_px = 100;
        scheduler.config.last_hour = 24; // Extends timeline to show full day
    scheduler.config.full_day = true;
    scheduler.locale.labels.full_day = 'All Day';
        scheduler.templates.event_class = function (start, end, event) {
            let classes = event.classname || 'purple';
            if (event.classname === 'violet') classes = 'pink'; // Map violet to pink since we renamed it
            return classes + ' dhx_cal_event--xsmall';
        };

    scheduler.templates.week_scale_date = function (date) {
      return scheduler.date.date_to_str('%D, %j')(date);
    };

    scheduler.templates.month_scale_date = function (date) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return dayNames[date.getDay()];
    };

    scheduler.templates.month_day = function (date) {
      const currentView = scheduler.getState().date;
      const currentMonth = currentView.getMonth();
      const currentYear = currentView.getFullYear();

      const isSameMonth = date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      const isSunday = date.getDay() === 0;

      if (isSunday) {
        if (isSameMonth) {
          return "<div class='centered-date sunday-date-current'>" + date.getDate() + '</div>';
        } else {
          return "<div class='centered-date sunday-date-adjacent'>" + date.getDate() + '</div>';
        }
      }

      return "<div class='centered-date'>" + date.getDate() + '</div>';
        };

        scheduler.templates.month_events_link = function (date, count) {
            return `<div class="dhx_month_link" style="padding-right: unset;">+${count} more</div>`;
        };
    scheduler.attachEvent('onViewChange', function () {
      setTimeout(() => {
        const parsedEvents = events.map((event) => ({
          ...event,
          start_date: new Date(event.start_date),
          end_date: new Date(event.end_date),
        }));
        scheduler.clearAll();
        scheduler.parse(parsedEvents);
      }, 10);
    });

        window.addEventListener('resize', () => {
            const isMobile = window.innerWidth < 630;
            scheduler.config.max_month_events = isMobile ? 5 : 5;
            scheduler.updateView();
        });
        const colors = [
            { key: 'purple', label: 'Purple' },
      { key: 'violet', label: 'Pink' },
            { key: 'green', label: 'Green' },
            { key: 'yellow', label: 'Yellow' },
            { key: 'blue', label: 'Blue' },
      { key: 'orange', label: 'Orange' },
        ];

    const selectmeExists = scheduler.config.lightbox.sections.some(
      (section) => section.name === 'selectme',
    );
        if (!selectmeExists) {
            scheduler.config.lightbox.sections.push({
        name: 'selectme',
                height: 110,
                options: colors,
        map_to: 'classname',
        type: 'radio',
        vertical: false,
            });
        }
        scheduler.clearAll();
    const parsedEvents = events.map((event) => ({
      ...event,
      start_date: new Date(event.start_date),
      end_date: new Date(event.end_date),
    }));
    scheduler.parse(parsedEvents);

    scheduler.locale.labels.section_selectme = 'Event Color';
        scheduler.plugins({
      editors: true,
        });

    scheduler.config.touch = true;
    scheduler.config.touch_swipe_dates = true;

    startDate
      ? scheduler.init(
          schedulerContainer.current,
          new Date(startDate ? new Date(startDate.year, startDate.month, startDate.date) : ''),
          'month',
        )
      : scheduler.init(schedulerContainer.current, new Date(), 'month');

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const minSwipeDistance = 50;
      if (touchEndX < touchStartX - minSwipeDistance) {
        scheduler.setCurrentView(scheduler.date.add(scheduler.getState().date, 1, 'month'));
      } else if (touchEndX > touchStartX + minSwipeDistance) {
        scheduler.setCurrentView(scheduler.date.add(scheduler.getState().date, -1, 'month'));
      }
    };

    const container = schedulerContainer.current;
    container.addEventListener('touchstart', handleTouchStart, false);
    container.addEventListener('touchend', handleTouchEnd, false);

        const style = document.createElement('style');
    style.innerHTML = `
            .dhx_month_link {
                padding-right: unset !important;
            }
                 .dhx_cal_event.yellow div,
            .event_box.yellow {
                background: linear-gradient(180deg, #FFB725 0%, #FFBB25 31.25%, #FAEA27 100%) !important;
                border-color: #FFBB25 !important;
            }
            .dhx_cal_event.purple div,
            .event_box.purple {
                background: linear-gradient(180deg, #5E3AE4 0%, #7557e3 100%) !important;
                border-color: #5E3AE4 !important;
            }
            .dhx_cal_event.blue div,
            .event_box.blue {
                background: linear-gradient(180deg, #3498db 0%, #2980b9 100%) !important;
                border-color: #3498db !important;
            }
            .dhx_cal_event.pink div,
            .dhx_cal_event.pink div,
            .event_box.pink {
                background: linear-gradient(180deg, #D071EF 0%, #EE71D5 100%) !important;
                border-color: #D071EF !important;
            }
            
            .centered-date {
                text-align: center !important;
                width: 100% !important;
                display: block !important;
            }
            
            .sunday-date-current {
                color: #e74c3c !important;
                font-weight: bold !important;
            }
            
            .sunday-date-adjacent {
                color: #f5a99a !important;
                opacity: 0.6;
            }
            .dhx_month_head {
                text-align: center !important;
            }
            
            .dhx_cal_container .dhx_cal_data .dhx_cal_event div {
                text-align: center !important;
            }
            
            .dhx_cal_container .dhx_cal_data .dhx_cal_event_line {
                text-align: center !important;
            }
            
            .dhx_cal_container .dhx_cal_data .dhx_cal_event_clear {
                text-align: center !important;
            }
            
            .dhx_cal_light .dhx_title {
                text-align: center !important;
            }
            
            .dhx_cal_event_line .dhx_event_text {
                text-align: center !important;
                width: 100% !important;
                display: block !important;
            }
            
            .dhx_cal_container .dhx_cal_data .dhx_cal_event_line {
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
            }
            .dhx_cal_event_clear {
                justify-content: center !important;
                padding: 0px !important;
                gap: 2px !important;
            }
            
            @media screen and (max-width: 630px) {
                .dhx_cal_event div {
                    font-size: 10px !important;
                    line-height: 1.1 !important;
                    text-align: center !important;
                }
                
                .dhx_cal_event_line {
                    font-size: 10px !important;
                    line-height: 1.1 !important;
                    text-align: center !important;
                    padding: 0px !important;
                }
                
                .dhx_cal_event_clear {
                    font-size: 10px !important;
                    text-align: center !important;
                }
                
                .dhx_scale_bar {
                    font-size: 12px !important;
                    padding: 0px !important;
                    text-align: center !important;
                }
                
                .dhx_month_head {
                    font-size: 12px !important;
                    padding: 0px !important;
                    text-align: center !important;
                }
}
                                .dhx_cal_navline {
                height: 60px !important;
                padding: 10px 10px !important;
                background: transparent !important;
                margin-bottom: 10px !important;
            }

            .dhx_cal_header {
                margin-top: 10px !important;
                height: 50px !important;
               
            }

            /* Container for day/week/month tabs */
    
            }
        `;

        document.head.appendChild(style);

        scheduler.createDataProcessor(function (entity, action, data, id) {
        if (data.allday) {
                data.start_date.setHours(0, 0, 0);
                data.end_date.setHours(23, 59, 59);
            }
            switch (action) {
        case 'create':
          return (
            scheduler.loading === false &&
            postEmployeeCalendarEvent(
              data.text,
              data.start_date,
              data.end_date,
              null,
              data.classname,
            )
          );
        case 'update':
          return (
            scheduler.loading === false &&
            postEmployeeCalendarEvent(data.text, data.start_date, data.end_date, id, data.classname)
          );
        case 'delete':
                    return scheduler.loading === false && deleteEmployeeCalendarEvent(id);
                default:
                    break;
            }
        });
   return () => {
            if (container) {
                container.removeEventListener('touchstart', handleTouchStart);
                container.removeEventListener('touchend', handleTouchEnd);
            }
        };
    }, [events, startDate, onEventAdded, refreshCalendarOnFailure, postEmployeeCalendarEvent, deleteEmployeeCalendarEvent]);

    useEffect(() => {
        schedulerInstance.current = window.scheduler;
    const cleanup = initScheduler();

        return () => {
            if (cleanup && typeof cleanup === 'function') {
                cleanup();
            }
        };
    }, [initScheduler]);

  return  (
        <>
        <div ref={schedulerContainer} style={{ width: '100%', height: '100%' }} />
            <div style={{ padding: '0.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <LegendItem classname="yellow" label="Johnston-Willis" />
                <LegendItem classname="purple" label="Parham" />
                <LegendItem classname="blue" label="PTO (Paid Time Off)" />
                <LegendItem classname="pink" label="Birthday" />
            </div>
        </>
    );
};

const LegendItem = ({ classname, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '14px' }}>
        <div className={`event_box ${classname}`} style={{
            width: '14px',
            height: '14px',
            borderRadius: '4px',
            border: '1px solid var(--border-subtle)'
        }} />
        <span className='text-secondary'>{label}</span>
    </div>
);

export default Scheduler;
