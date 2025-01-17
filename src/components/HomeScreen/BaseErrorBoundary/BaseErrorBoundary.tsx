import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Component } from 'react';
import classes from './base-error-boundary.module.scss';

export class BaseErrorBoundary extends Component {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    constructor(props) {
        super(props);
        this.state = { error: '' };
    }

    componentDidCatch(error: { name: any; message: any }) {
        this.setState({ error: `${error.name}: ${error.message}` });
    }

    // internet explorer doesnt support this project anyways.
    componentDidMount() {
        //checks what browser the user is using.
        //console.log(navigator.userAgent);
        const ie = false;
        if (ie) {
            this.setState({ error: `דפדפן לא נתמך: איטרנט אקספלורר` });
        }
        // internet explorer logic set error
    }

    render() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const { error } = this.state;
        if (error) {
            return (
                <div className={classes.container}>
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                    <h1>אירעה שגיאה</h1>
                    <p>{error}</p>
                </div>
            );
        } else {
            return <>{this.props.children}</>;
        }
    }
}
