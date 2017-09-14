import React, { PureComponent } from 'react';
import PropTypes, { string } from 'prop-types';
import Helmet from 'react-helmet';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withJob } from 'react-jobs';
// import Helmet from 'react-helmet';
import { getPostFromAPI } from '../../actions';

class AsyncExample extends PureComponent {
	render() {
		const { title, body } = this.props.post;

    if (!this.props.post) {
      // Post hasn't been fetched yet. It would be better if we had a "status"
      // reducer attached to our posts which gave us a bit more insight, such
      // as whether the post is currently being fetched, or if the fetch failed.
      return null;
    }

		return (
			<div>
        <Helmet title={title} />
				<h1>{title} (from api)</h1>
				<div>
					{body}
				</div>
			</div>
		);
	}
}

function mapStateToProps(state, { match }) {
  return {
    post: state.posts.post
  };
}

const mapActionsToProps = {
  getData: getPostFromAPI
};

// We use the "compose" function from redux (but the lodash/ramda/etc equivalent
// would do the same), so that we can neatly attach multiple higher order
// functions to our component.
// They get attached to our component from a bottom up approach (i.e. the
// arguments of compose from right to left).
// Firstly the "withJob" is attached, indicating we want to do some async work.
// Then the redux "connect" is attached.
// This means the redux state and action will be passed through our "withJob".
// The job is meant to fire the fetching of a post.  If no post exists within
// the redux state it will fire the "fetchPost" redux-thunk action.  If you
// look at that action you will see it returns a Promise. It is a requirement
// to return a Promise when executing an asynchronous job so that the job
// runner knows when the job is complete.  You will also see that we first
// check to see if the post already exists within the state, if so we just
// return it which would then result in a synchronous execution of our component.
export default compose(
  connect(mapStateToProps, mapActionsToProps),
  withJob({
    work: ({ match, post, getData }) => {
			if (post) {
				// We already have a post, just return true.
				return true;
			}

      // Execute the redux-thunk powered action that returns a Promise and
      // fetches the post.
      return getData();
    },
    // Any time the post id changes we need to trigger the work.
    // shouldWorkAgain: (prevProps, nextProps) => prevProps.match.params.id !== nextProps.match.params.id,
  }),
)(AsyncExample);

AsyncExample.propTypes = {
  post: PropTypes.shape({
    title: string,
    body: string,
  }),
};

AsyncExample.defaultProps = {
  post: {},
};
