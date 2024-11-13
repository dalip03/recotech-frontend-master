import { useEffect, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import classNames from 'classnames';
import withHeaderItem from '@/utils/hoc/withHeaderItem';
import Dropdown from '@/components/ui/Dropdown';
import ScrollBar from '@/components/ui/ScrollBar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import {
    HiOutlineBell,
    HiOutlineMailOpen,
} from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import useThemeClass from '@/utils/hooks/useThemeClass';
import { useAppSelector } from '@/store';
import useResponsive from '@/utils/hooks/useResponsive';
import { UserRole } from '@/utils/sharedHelpers';

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL ?? 'ws://localhost:8080/ws';

export interface NotificationObject {
    roles: UserRole[];  // Array of roles that can receive the notification
    userId: number[]; // Array of user IDs that can receive the notification
    redirectUrl: string; // URL to redirect to when the notification is clicked
}

export interface NotificationType {
    object: NotificationObject;      // The object property is a JSON string
    objectId: number;    // The ID of the object related to the notification
    type: string;        // The type of notification (e.g., "MESSAGE_RECEIVED")
    message: string;     // The notification message
    timestamp: string;   // The timestamp of when the notification was created
    status: string;      // The status of the notification (e.g., "UNREAD")
    from: string;        // The username of the sender
}

const _Notification = ({ className }: { className?: string }) => {
    const [notificationList, setNotificationList] = useState<any>([]);
    const [unreadNotification, setUnreadNotification] = useState(false);
    const user = useAppSelector((state) => state.auth.user);
    const token = useAppSelector((state) => state.auth.session.token);
    const { bgTheme } = useThemeClass();
    const { larger } = useResponsive();
    const direction = useAppSelector((state) => state.theme.direction);

    const navigate = useNavigate();

    useEffect(() => {
        const client = new Client({
            brokerURL: WEBSOCKET_URL,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            onConnect: () => {
                client.subscribe('/topic/notifications', (message: IMessage) => {
                    const newNotification = JSON.parse(message.body);

                    // Parse the 'object' property which is a JSON string
                    const notificationDetails = JSON.parse(newNotification.object);
                    newNotification.object = notificationDetails;

                    // Check if the current user's role or ID matches the notification's target roles or user IDs
                    const shouldNotify =
                        (Array.isArray(notificationDetails.roles) &&
                            notificationDetails.roles.includes(user.authority)) ||
                        (Array.isArray(notificationDetails.userId) && // Use userId as it is an array
                            notificationDetails.userId.includes(user.id));

                    // Only add notification if it's relevant and not from the current user
                    if (shouldNotify && newNotification.from !== user.username) {
                        setNotificationList((prevNotifications: any) => [
                            newNotification,
                            ...prevNotifications,
                        ]);
                        setUnreadNotification(true);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame.headers['message']);
                console.error('Details:', frame.body);
            },
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [token, user.id, user.authority]);

    const onNotificationOpen = async () => {
        setUnreadNotification(false);
    };

    const onMarkAllAsRead = useCallback(() => {
        setNotificationList((prevNotifications: any) =>
            prevNotifications.map((notification: any) => ({
                ...notification,
                readed: true,
            }))
        );
        setUnreadNotification(false);
    }, []);

    const handleClick = useCallback(
        (item: any) => {
            setNotificationList((prevNotifications: any) =>
                prevNotifications.map((notification: any) =>
                    notification.id === item.id ? { ...notification, readed: true } : notification
                )
            );

            const hasUnread = notificationList.some((notification: any) => !notification.readed);
            setUnreadNotification(hasUnread);
            if (item.object.redirectUrl) {
                navigate(item.object.redirectUrl);
            }
        },
        [notificationList]
    );

    return (
        <Dropdown
            renderTitle={
                <div className={classNames('text-2xl', className)}>
                    {unreadNotification ? (
                        <Badge badgeStyle={{ top: '3px', right: '6px' }}>
                            <HiOutlineBell />
                        </Badge>
                    ) : (
                        <HiOutlineBell />
                    )}
                </div>
            }
            menuClass="p-0 min-w-[280px] md:min-w-[340px]"
            placement={larger.md ? 'bottom-end' : 'bottom-center'}
            onOpen={onNotificationOpen}
        >
            <Dropdown.Item variant="header">
                <div className="border-b border-gray-200 dark:border-gray-600 px-4 py-2 flex items-center justify-between">
                    <h6>Notifications</h6>
                    <Tooltip title="Mark all as read">
                        <Button
                            variant="plain"
                            shape="circle"
                            size="sm"
                            icon={<HiOutlineMailOpen className="text-xl" />}
                            onClick={onMarkAllAsRead}
                        />
                    </Tooltip>
                </div>
            </Dropdown.Item>
            <div className={classNames('overflow-y-auto', 'h-72')}>
                <ScrollBar direction={direction}>
                    {notificationList.length > 0 ? (
                        notificationList.map((item: any, index: number) => (
                            <div
                                key={item.id}
                                className={`relative flex px-4 py-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-black dark:hover:bg-opacity-20 ${index !== notificationList.length - 1
                                    ? 'border-b border-gray-200 dark:border-gray-600'
                                    : ''
                                    }`}
                                onClick={() => handleClick(item)}
                            >
                                <div>{/* Render notification avatar or icon here */}</div>
                                <div className="ltr:ml-3 rtl:mr-3">
                                    <div>
                                        {item.target && (
                                            <span className="font-semibold heading-text">
                                                {item.target}{' '}
                                            </span>
                                        )}
                                        <span>{item.message}</span>
                                    </div>
                                    <span className="text-xs">{new Date(item.timestamp).toLocaleString()}</span>
                                </div>
                                <Badge
                                    className="absolute top-4 ltr:right-4 rtl:left-4 mt-1.5"
                                    innerClass={`${item.readed ? 'bg-gray-300' : bgTheme}`}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-4">
                            <p>No new notifications</p>
                        </div>
                    )}
                </ScrollBar>
            </div>
            <Dropdown.Item variant="header">
                <div className="flex justify-center border-t border-gray-200 dark:border-gray-600 px-4 py-2">
                    <Link to="/app/account/activity-log" className="font-semibold p-2 px-3 text-gray-600 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
                        View All Activity
                    </Link>
                </div>
            </Dropdown.Item>
        </Dropdown>
    );
};

const Notification = withHeaderItem(_Notification);
export default Notification;
